const mongoose = require("mongoose");
const config = require("./config");
const LoggingUtil = require("../utils/loggingUtil");

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      LoggingUtil.info("MongoDB is already connected");
      return mongoose.connection;
    }

    // Validate MongoDB URI
    if (!config.database.uri) {
      throw new Error(
        "MongoDB URI is not configured. Please check your .env file."
      );
    }

    console.log("Connecting to MongoDB with URI:", config.database.uri);
    console.log("Using DB name:", config.database.name);

    // Connect with retry mechanism and improved options
    const conn = await mongoose.connect(config.database.uri, {
      ...config.database.options,
      dbName: config.database.name,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: "majority",
      serverApi: {
        version: "1",
        strict: false, // Disable strict mode to allow text indexes
        deprecationErrors: true,
      },
    });

    // Enable mongoose debug mode in development
    mongoose.set("debug", process.env.NODE_ENV === "development");

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      LoggingUtil.error("MongoDB connection error:", err);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        LoggingUtil.info(
          `Retrying connection... Attempt ${retryCount}/${MAX_RETRIES}`
        );
        setTimeout(connectDB, 5000 * retryCount);
      } else {
        LoggingUtil.error("Max retry attempts reached. Exiting...");
        process.exit(1);
      }
    });

    mongoose.connection.on("disconnected", () => {
      LoggingUtil.warn("MongoDB disconnected");
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        connectDB();
      }
    });

    mongoose.connection.on("connected", () => {
      LoggingUtil.info("MongoDB connected successfully");
      retryCount = 0; // Reset retry count on successful connection
    });

    // Handle application termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      LoggingUtil.info("MongoDB connection closed through app termination");
      process.exit(0);
    });

    await setupDatabase();

    return conn;
  } catch (error) {
    LoggingUtil.error("MongoDB connection error:", error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      LoggingUtil.info(
        `Retrying connection... Attempt ${retryCount}/${MAX_RETRIES}`
      );
      return new Promise((resolve) =>
        setTimeout(() => resolve(connectDB()), 5000 * retryCount)
      );
    }
    throw error;
  }
};

async function setupDatabase() {
  try {
    // Create indexes for better query performance
    await Promise.all([
      mongoose.model("User").createIndexes(),
      mongoose.model("Store").createIndexes(),
      mongoose.model("Product").createIndexes(),
      mongoose.model("Inventory").createIndexes(),
      mongoose.model("ActivityLog").createIndexes(),
      mongoose.model("Dashboard").createIndexes(),
      mongoose.model("Settings").createIndexes(),
      mongoose.model("SupportTicket").createIndexes(),
    ]);

    // Create TTL index for activity logs (30 days)
    const ActivityLog = mongoose.model("ActivityLog");
    await ActivityLog.collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );

    // Create text indexes for search functionality with background option
    const Product = mongoose.model("Product");
    await Product.collection.createIndex(
      { name: "text", description: "text" },
      { background: true }
    );

    // Create compound indexes for common queries
    const Inventory = mongoose.model("Inventory");
    await Inventory.collection.createIndex({ store: 1, status: 1 });

    const Store = mongoose.model("Store");
    await Store.collection.createIndex({ owner: 1 });

    LoggingUtil.info("Database indexes created successfully");
  } catch (error) {
    LoggingUtil.error("Error setting up database:", error);
    throw error;
  }
}

module.exports = connectDB;

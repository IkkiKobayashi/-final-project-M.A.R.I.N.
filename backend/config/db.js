const mongoose = require("mongoose");
const config = require("./config");
const LoggingUtil = require("../utils/loggingUtil");

const MAX_RETRIES = 3;
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

    // Connect with retry mechanism
    const conn = await mongoose.connect(config.database.uri, {
      ...config.database.options,
      dbName: config.database.name,
      useNewUrlParser: true,
      useUnifiedTopology: true,
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

module.exports = connectDB;

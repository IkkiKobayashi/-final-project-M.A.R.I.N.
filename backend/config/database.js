const mongoose = require("mongoose");
const config = require("./config");
const LoggingUtil = require("../utils/loggingUtil");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await setupDatabase();
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function setupDatabase() {
  try {
    // Create indexes for better query performance
    await Promise.all([
      mongoose.model('User').createIndexes(),
      mongoose.model('Store').createIndexes(),
      mongoose.model('Product').createIndexes(),
      mongoose.model('Inventory').createIndexes(),
      mongoose.model('ActivityLog').createIndexes(),
      mongoose.model('Dashboard').createIndexes(),
      mongoose.model('Settings').createIndexes(),
      mongoose.model('SupportTicket').createIndexes()
    ]);

    // Create TTL index for activity logs (30 days)
    const ActivityLog = mongoose.model('ActivityLog');
    await ActivityLog.collection.createIndex(
      { "createdAt": 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 }
    );

    // Create text indexes for search functionality
    const Product = mongoose.model('Product');
    await Product.collection.createIndex(
      { name: "text", description: "text" }
    );

    // Create compound indexes for common queries
    const Inventory = mongoose.model('Inventory');
    await Inventory.collection.createIndex(
      { store: 1, status: 1 }
    );

    const Store = mongoose.model('Store');
    await Store.collection.createIndex(
      { owner: 1 }
    );

    LoggingUtil.info('Database indexes created successfully');
  } catch (error) {
    LoggingUtil.error('Error setting up database:', error);
    throw error;
  }
}

module.exports = { connectDB, setupDatabase };

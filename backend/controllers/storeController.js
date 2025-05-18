const Store = require("../models/Store");
const Product = require("../models/Product");
const SupportTicket = require("../models/SupportTicket");
const Settings = require("../models/Settings");
const Inventory = require("../models/Inventory");
const Dashboard = require("../models/Dashboard");
const ActivityLog = require("../models/ActivityLog");
const mongoose = require("mongoose");
const { ErrorHandler } = require("../utils/errorHandler");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getStores = async (req, res) => {
  try {
    console.log("Fetching stores...");
    const stores = await Store.find();
    console.log("Found stores:", stores);

    res.status(200).json({
      success: true,
      data: stores,
      count: stores.length,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stores",
      error: error.message,
    });
  }
};

exports.getStoreById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID format",
      });
    }

    const store = await Store.findById(req.params.id).populate("owner");
    if (!store) {
      return next(ErrorHandler.notFoundError("Store not found"));
    }
    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

exports.createStore = async (req, res) => {
  try {
    console.log("Creating store with data:", req.body);

    // Validate required fields
    const requiredFields = ["name", "location", "code"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if store code already exists
    const existingStore = await Store.findOne({ code: req.body.code });
    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "Store code already exists",
      });
    }

    const store = await Store.create(req.body);
    console.log("Store created:", store);

    res.status(201).json({
      success: true,
      data: store,
      message: "Store created successfully",
    });
  } catch (error) {
    console.error("Store creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create store",
      error: error.name === "ValidationError" ? error.errors : undefined,
    });
  }
};

exports.updateStore = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID format",
      });
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(ErrorHandler.notFoundError("Store not found"));
    }

    Object.assign(store, req.body);
    await store.save();

    // Log activity
    await new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "edit",
      entityType: "store",
      entityId: store._id,
      details: `Updated store: ${store.name}`,
    }).save();

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

exports.deleteStore = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID format",
      });
    }

    console.log("Starting store deletion process for store ID:", req.params.id);

    // First check if store exists
    const store = await Store.findById(req.params.id);
    if (!store) {
      console.log("Store not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    console.log("Found store:", store.name);

    try {
      // Delete the store first
      console.log("Attempting to delete store:", req.params.id);
      const deletedStore = await Store.deleteOne({ _id: req.params.id });

      if (deletedStore.deletedCount === 0) {
        throw new Error("Failed to delete store - no documents deleted");
      }

      console.log("Store deleted successfully");

      // Then delete all related documents
      console.log("Deleting related documents for store:", req.params.id);

      const deletePromises = [
        Product.deleteMany({ store: req.params.id }),
        SupportTicket.deleteMany({ store: req.params.id }),
        Settings.deleteMany({ store: req.params.id }),
        Inventory.deleteMany({ store: req.params.id }),
        Dashboard.deleteMany({ store: req.params.id }),
        ActivityLog.deleteMany({ store: req.params.id }),
      ];

      const results = await Promise.allSettled(deletePromises);

      // Log results
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(
            `Successfully deleted related documents for index ${index}`
          );
        } else {
          console.error(
            `Failed to delete related documents for index ${index}:`,
            result.reason
          );
        }
      });

      return res.status(200).json({
        success: true,
        message: "Store deleted successfully",
        data: {
          store: store,
          deletedCount: deletedStore.deletedCount,
        },
      });
    } catch (deleteError) {
      console.error("Error during store deletion:", {
        error: deleteError.message,
        stack: deleteError.stack,
        storeId: req.params.id,
      });
      throw deleteError;
    }
  } catch (error) {
    console.error("Store deletion error:", {
      error: error.message,
      stack: error.stack,
      storeId: req.params.id,
      name: error.name,
      code: error.code,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: error.message || "Database operation failed",
    });
  }
};

exports.updateStoreInventory = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID format",
      });
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.inventory = req.body.inventory;
    await store.save();

    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

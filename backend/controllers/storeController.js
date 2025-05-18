const Store = require("../models/Store");
const Product = require("../models/Product");
const { ErrorHandler } = require("../utils/errorHandler");

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
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Delete all products associated with this store
    await Product.deleteMany({ store: req.params.id });

    // Now delete the store
    await Store.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Store and associated products deleted successfully",
      data: store,
    });
  } catch (error) {
    console.error("Store deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: error.message,
    });
  }
};

exports.updateStoreInventory = async (req, res) => {
  try {
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

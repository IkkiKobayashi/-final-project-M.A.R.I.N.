const Store = require("../models/Store");
const ActivityLog = require("../models/ActivityLog");
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

    if (!req.body.name || !req.body.location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const store = await Store.create(req.body);
    console.log("Store created:", store);

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("Store creation error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create store",
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
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return next(ErrorHandler.notFoundError("Store not found"));
    }

    // Log activity
    await new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "delete",
      entityType: "store",
      entityId: store._id,
      details: `Deleted store: ${store.name}`,
    }).save();

    res.json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
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

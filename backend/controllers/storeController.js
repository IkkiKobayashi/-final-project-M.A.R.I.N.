const Store = require("../models/Store");
const ActivityLog = require("../models/ActivityLog");
const { ErrorHandler } = require("../utils/errorHandler");

exports.getStores = async (req, res, next) => {
  try {
    const stores = await Store.find().populate("owner");
    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
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

exports.createStore = async (req, res, next) => {
  try {
    const store = new Store({
      ...req.body,
      owner: req.user.userId,
    });
    await store.save();

    // Log activity
    await new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "create",
      entityType: "store",
      entityId: store._id,
      details: `Created new store: ${store.name}`,
    }).save();

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
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

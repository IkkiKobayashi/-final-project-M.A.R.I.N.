const Store = require("../models/Store");
const ActivityLog = require("../models/ActivityLog");

exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate("owner");
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate("owner");
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const store = new Store({
      ...req.body,
      owner: req.user.userId,
    });
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
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

    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

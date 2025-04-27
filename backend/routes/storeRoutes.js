const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const User = require("../models/User");
const { auth, checkRole } = require("../middleware/auth");
const ActivityLog = require("../models/ActivityLog");

// All routes require authentication
router.use(auth);

// Create store (admin only)
router.post("/", checkRole(["admin"]), async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "add",
      entityType: "store",
      entityId: store._id,
      details: `Created new store: ${store.name}`,
    });
    await activity.save();

    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all stores
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find()
      .populate("manager", "name email")
      .populate("employees", "name email role");
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("manager", "name email")
      .populate("employees", "name email role");
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update store (admin and manager only)
router.put("/:id", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Only admin can change manager, or manager can update their own store
    if (
      req.user.role !== "admin" &&
      store.manager.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this store" });
    }

    Object.assign(store, req.body);
    await store.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "edit",
      entityType: "store",
      entityId: store._id,
      details: `Updated store: ${store.name}`,
    });
    await activity.save();

    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete store (admin only)
router.delete("/:id", checkRole(["admin"]), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Remove store reference from all associated users
    await User.updateMany({ store: store._id }, { $unset: { store: "" } });

    await store.remove();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: store._id,
      action: "delete",
      entityType: "store",
      entityId: store._id,
      details: `Deleted store: ${store.name}`,
    });
    await activity.save();

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store statistics
router.get("/:id/statistics", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const employeeCount = await User.countDocuments({ store: store._id });
    const managers = await User.find({
      store: store._id,
      role: "manager",
    }).select("name email");

    res.json({
      store: {
        name: store.name,
        address: store.address,
        status: store.status,
      },
      employeeCount,
      managers,
      settings: store.settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update store settings
router.put(
  "/:id/settings",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      store.settings = { ...store.settings, ...req.body };
      await store.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: store._id,
        action: "edit",
        entityType: "store",
        entityId: store._id,
        details: "Updated store settings",
      });
      await activity.save();

      res.json(store);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;

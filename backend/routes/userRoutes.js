const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, checkRole } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all users (admin only)
router.get("/", checkRole(["admin"]), async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("store", "name address");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users by store
router.get(
  "/store/:storeId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const users = await User.find({ store: req.params.storeId })
        .select("-password")
        .populate("store", "name address");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("store", "name address");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Users can only view their own profile unless they're admin/manager
    if (
      req.user.role !== "admin" &&
      req.user.role !== "manager" &&
      user._id.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this profile" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    // Users can only update their own profile unless they're admin
    if (req.user.role !== "admin" && req.params.id !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only admin can update role or store assignment
    const updatedData = { ...req.body };
    if (req.user.role !== "admin") {
      delete updatedData.role;
      delete updatedData.store;
    }

    Object.assign(user, updatedData);
    await user.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: user.store,
      action: "edit",
      entityType: "user",
      entityId: user._id,
      details: `Updated user profile: ${user.name}`,
    });
    await activity.save();

    res.json({
      user: user.toObject({
        getters: true,
        versionKey: false,
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      }),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete("/:id", checkRole(["admin"]), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store user data for activity log
    const userData = {
      name: user.name,
      store: user.store,
    };

    await user.remove();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: userData.store,
      action: "delete",
      entityType: "user",
      entityId: req.params.id,
      details: `Deleted user: ${userData.name}`,
    });
    await activity.save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (admin only)
router.patch("/:id/status", checkRole(["admin"]), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: user.store,
      action: "edit",
      entityType: "user",
      entityId: user._id,
      details: `Updated user status: ${user.name} is now ${
        isActive ? "active" : "inactive"
      }`,
    });
    await activity.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

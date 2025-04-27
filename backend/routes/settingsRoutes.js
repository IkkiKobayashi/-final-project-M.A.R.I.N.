const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { auth, checkRole } = require("../middleware/auth");
const ActivityLog = require("../models/ActivityLog");

// All routes require authentication
router.use(auth);

// Get global settings
router.get("/global", async (req, res) => {
  try {
    let settings = await Settings.findOne({ scope: "global" });
    if (!settings) {
      settings = await Settings.create({ scope: "global" });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store settings
router.get("/store/:storeId", async (req, res) => {
  try {
    let settings = await Settings.findOne({
      scope: "store",
      store: req.params.storeId,
    });
    if (!settings) {
      settings = await Settings.create({
        scope: "store",
        store: req.params.storeId,
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update global settings (admin only)
router.put("/global", checkRole(["admin"]), async (req, res) => {
  try {
    let settings = await Settings.findOne({ scope: "global" });
    if (!settings) {
      settings = new Settings({ scope: "global" });
    }

    // Update settings
    Object.assign(settings, req.body);
    await settings.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      action: "edit",
      entityType: "settings",
      entityId: settings._id,
      details: "Updated global settings",
    });
    await activity.save();

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update store settings (admin and manager)
router.put(
  "/store/:storeId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      let settings = await Settings.findOne({
        scope: "store",
        store: req.params.storeId,
      });

      if (!settings) {
        settings = new Settings({
          scope: "store",
          store: req.params.storeId,
        });
      }

      // Update settings
      Object.assign(settings, req.body);
      await settings.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: req.params.storeId,
        action: "edit",
        entityType: "settings",
        entityId: settings._id,
        details: "Updated store settings",
      });
      await activity.save();

      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get notification settings for user
router.get("/notifications", async (req, res) => {
  try {
    let settings = await Settings.findOne({
      scope: "user",
      user: req.user.userId,
    });

    if (!settings) {
      settings = await Settings.create({
        scope: "user",
        user: req.user.userId,
        notifications: {
          email: {
            lowStock: true,
            expiringItems: true,
            activityAlerts: true,
          },
          push: {
            lowStock: true,
            expiringItems: true,
            activityAlerts: true,
          },
        },
      });
    }
    res.json(settings.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update notification settings for user
router.put("/notifications", async (req, res) => {
  try {
    let settings = await Settings.findOne({
      scope: "user",
      user: req.user.userId,
    });

    if (!settings) {
      settings = new Settings({
        scope: "user",
        user: req.user.userId,
      });
    }

    settings.notifications = req.body;
    await settings.save();

    res.json(settings.notifications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

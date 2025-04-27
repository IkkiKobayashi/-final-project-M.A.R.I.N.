const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");
const { auth, checkRole } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all activities for a store
router.get("/store/:storeId", async (req, res) => {
  try {
    const { startDate, endDate, action, entityType, userId } = req.query;

    let query = { store: req.params.storeId };

    // Apply filters if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userId) query.user = userId;

    const activities = await ActivityLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities by user
router.get(
  "/user/:userId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const activities = await ActivityLog.find({ user: req.params.userId })
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(50);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get activities by entity
router.get("/entity/:entityType/:entityId", async (req, res) => {
  try {
    const activities = await ActivityLog.find({
      entityType: req.params.entityType,
      entityId: req.params.entityId,
    })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities for dashboard
router.get("/recent/:storeId", async (req, res) => {
  try {
    const activities = await ActivityLog.find({ store: req.params.storeId })
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity statistics
router.get(
  "/statistics/:storeId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const stats = await ActivityLog.aggregate([
        {
          $match: {
            store: req.params.storeId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              action: "$action",
              entityType: "$entityType",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

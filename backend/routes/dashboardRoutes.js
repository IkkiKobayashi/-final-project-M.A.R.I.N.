const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");
const Dashboard = require("../models/Dashboard");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const User = require("../models/User");
const dashboardController = require("../controllers/dashboardController");

// All routes require authentication
router.use(auth);

// Create or update dashboard
router.post("/", async (req, res) => {
  try {
    const { user, store } = req.body;
    let dashboard = await Dashboard.findOne({ user, store });

    if (dashboard) {
      dashboard = await Dashboard.findOneAndUpdate({ user, store }, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      dashboard = new Dashboard(req.body);
      await dashboard.save();
    }

    res.status(201).json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user dashboard
router.get("/user/:userId", async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({
      user: req.params.userId,
    }).populate("store");
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard data
router.get("/store/:storeId", async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    // Get inventory summary
    const inventorySummary = await Inventory.aggregate([
      { $match: { store: req.params.storeId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get expiring products
    const expiringProducts = await Inventory.find({
      store: req.params.storeId,
      expiryDate: { $lte: thirtyDaysFromNow, $gt: now },
    }).populate("product");

    // Get recent activities
    const recentActivities = await ActivityLog.find({
      store: req.params.storeId,
    })
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get employee stats
    const employeeStats = await User.aggregate([
      { $match: { store: req.params.storeId } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format response
    const dashboardData = {
      inventory: {
        total: await Inventory.countDocuments({ store: req.params.storeId }),
        lowStock:
          inventorySummary.find((s) => s._id === "low_stock")?.count || 0,
        outOfStock:
          inventorySummary.find((s) => s._id === "out_of_stock")?.count || 0,
      },
      expiringProducts: expiringProducts.map((item) => ({
        id: item._id,
        name: item.product.name,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
      })),
      recentActivities: recentActivities.map((activity) => ({
        id: activity._id,
        user: activity.user.name,
        action: activity.action,
        entityType: activity.entityType,
        details: activity.details,
        timestamp: activity.createdAt,
      })),
      employeeStats: {
        total: employeeStats.reduce((acc, stat) => acc + stat.count, 0),
        byRole: Object.fromEntries(
          employeeStats.map((stat) => [stat._id, stat.count])
        ),
      },
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update dashboard layout preferences
router.put("/preferences", auth, async (req, res) => {
  try {
    const { layout, widgets, refreshInterval } = req.body;

    let dashboard = await Dashboard.findOne({
      user: req.user.userId,
      store: req.user.store,
    });

    if (dashboard) {
      dashboard.layout = layout || dashboard.layout;
      dashboard.widgets = widgets || dashboard.widgets;
      dashboard.refreshInterval = refreshInterval || dashboard.refreshInterval;
    } else {
      dashboard = new Dashboard({
        user: req.user.userId,
        store: req.user.store,
        layout,
        widgets,
        refreshInterval,
      });
    }

    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard alerts
router.get("/alerts/:storeId", async (req, res) => {
  try {
    const now = new Date();
    const alerts = [];

    // Check for low stock items
    const lowStockItems = await Inventory.find({
      store: req.params.storeId,
      status: "low_stock",
    }).populate("product");

    if (lowStockItems.length > 0) {
      alerts.push({
        type: "low_stock",
        severity: "warning",
        message: `${lowStockItems.length} items are running low on stock`,
        items: lowStockItems.map((item) => ({
          id: item._id,
          name: item.product.name,
          quantity: item.quantity,
        })),
      });
    }

    // Check for expiring items
    const expiringItems = await Inventory.find({
      store: req.params.storeId,
      expiryDate: {
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        $gt: now,
      },
    }).populate("product");

    if (expiringItems.length > 0) {
      alerts.push({
        type: "expiring_soon",
        severity: "warning",
        message: `${expiringItems.length} items are expiring within 7 days`,
        items: expiringItems.map((item) => ({
          id: item._id,
          name: item.product.name,
          expiryDate: item.expiryDate,
        })),
      });
    }

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update dashboard layout
router.patch("/:id/layout", async (req, res) => {
  try {
    const { layout } = req.body;
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { layout },
      { new: true, runValidators: true }
    );
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update dashboard widgets
router.patch("/:id/widgets", async (req, res) => {
  try {
    const { widgets } = req.body;
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { widgets },
      { new: true, runValidators: true }
    );
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update dashboard theme
router.patch("/:id/theme", async (req, res) => {
  try {
    const { theme } = req.body;
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { theme },
      { new: true, runValidators: true }
    );
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update refresh interval
router.patch("/:id/refresh", async (req, res) => {
  try {
    const { refreshInterval } = req.body;
    const dashboard = await Dashboard.findByIdAndUpdate(
      req.params.id,
      { refreshInterval },
      { new: true, runValidators: true }
    );
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dashboard metrics
router.get("/metrics/:storeId", dashboardController.getDashboardMetrics);

module.exports = router;

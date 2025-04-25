const express = require("express");
const router = express.Router();
const Dashboard = require("../models/Dashboard");

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

// Get store dashboard
router.get("/store/:storeId", async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({
      store: req.params.storeId,
    }).populate("user");
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }
    res.json(dashboard);
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

module.exports = router;

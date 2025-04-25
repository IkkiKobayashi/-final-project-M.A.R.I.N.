const express = require("express");
const router = express.Router();
const Store = require("../models/Store");

// Create store
router.post("/", async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all stores
router.get("/", async (req, res) => {
  try {
    const stores = await Store.find().populate("manager");
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get store by ID
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate("manager");
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update store
router.put("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete store
router.delete("/:id", async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stores by manager
router.get("/manager/:managerId", async (req, res) => {
  try {
    const stores = await Store.find({ manager: req.params.managerId });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search stores
router.get("/search/:query", async (req, res) => {
  try {
    const stores = await Store.find({
      $or: [
        { name: { $regex: req.params.query, $options: "i" } },
        { code: { $regex: req.params.query, $options: "i" } },
        { "address.city": { $regex: req.params.query, $options: "i" } },
      ],
    });
    res.json(stores);
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
    // Add your statistics logic here
    res.json({
      totalProducts: 0, // Calculate from inventory
      lowStockItems: 0, // Calculate from inventory
      totalEmployees: 0, // Calculate from users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

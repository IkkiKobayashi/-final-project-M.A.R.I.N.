const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

// Create inventory record
router.post("/", async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all inventory records
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product")
      .populate("store");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by ID
router.get("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate("product")
      .populate("store");
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inventory
router.put("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete inventory record
router.delete("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json({ message: "Inventory record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by store
router.get("/store/:storeId", async (req, res) => {
  try {
    const inventory = await Inventory.find({
      store: req.params.storeId,
    }).populate("product");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by product
router.get("/product/:productId", async (req, res) => {
  try {
    const inventory = await Inventory.find({
      product: req.params.productId,
    }).populate("store");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock items
router.get("/low-stock/:storeId", async (req, res) => {
  try {
    const inventory = await Inventory.find({
      store: req.params.storeId,
      quantity: { $lte: "$minStockLevel" },
    }).populate("product");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock quantity
router.patch("/:id/quantity", async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

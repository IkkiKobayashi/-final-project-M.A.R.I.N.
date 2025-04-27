const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, checkRole } = require("../middleware/auth");
const ActivityLog = require("../models/ActivityLog");

// All routes require authentication
router.use(auth);

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("supplier");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products for a store
router.get("/store/:storeId", async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplier");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (admin and manager only)
router.post("/", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      createdBy: req.user.userId,
    });

    await product.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: product.store,
      action: "add",
      entityType: "product",
      entityId: product._id,
      details: `Added new product: ${product.name}`,
    });
    await activity.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (admin and manager only)
router.put("/:id", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    await product.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: product.store,
      action: "edit",
      entityType: "product",
      entityId: product._id,
      details: `Updated product: ${product.name}`,
    });
    await activity.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete("/:id", checkRole(["admin"]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.remove();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: product.store,
      action: "delete",
      entityType: "product",
      entityId: product._id,
      details: `Deleted product: ${product.name}`,
    });
    await activity.save();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by supplier
router.get("/supplier/:supplierId", async (req, res) => {
  try {
    const products = await Product.find({ supplier: req.params.supplierId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get("/search/:query", async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const products = await Product.find({
      $and: [
        { store: req.query.storeId },
        {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { sku: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Store = require("../models/Store");
const ActivityLog = require("../models/ActivityLog");
const { auth } = require("../middleware/auth");
const generateSKU = require("../utils/skuGenerator");

// Apply auth middleware to all routes
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

// Create product
router.post("/", async (req, res) => {
  try {
    console.log("Received product data:", req.body);

    // Validate required fields
    if (
      !req.body.name ||
      !req.body.price ||
      !req.body.quantity ||
      !req.body.type ||
      !req.body.expiry
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Generate SKU first before creating product
    const generatedSKU = await generateSKU(req.body.name);
    if (!generatedSKU) {
      throw new Error("Failed to generate SKU");
    }

    // Create product with generated SKU
    const product = new Product({
      name: req.body.name,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      expiry: req.body.expiry,
      type: req.body.type,
      image: req.body.image || "img/default-product.png",
      store: req.body.storeId,
      sku: generatedSKU, // Add the generated SKU
    });

    console.log("Attempting to save product:", product);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.stack,
    });
  }
});

// Update product (admin and manager only)
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Store = require("../models/Store");
const { auth } = require("../middleware/auth");
const generateSKU = require("../utils/skuGenerator");

// Apply auth middleware to all routes
router.use(auth);

// Get all products
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;
    console.log("GET /products - Request received");
    console.log("Query params:", req.query);

    const query = storeId ? { store: storeId } : {};
    console.log("Executing query:", query);

    const products = await Product.find(query)
      .populate("store", "name address")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get("/search/:query", async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const { storeId } = req.query;

    const products = await Product.find({
      $and: [
        { store: storeId },
        {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { sku: { $regex: searchQuery, $options: "i" } },
          ],
        },
      ],
    })
      .populate("store", "name address")
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
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

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("store", "name address")
      .lean();
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
    console.log("POST /products - Request received");
    console.log("Request body:", req.body);

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
      sku: generatedSKU,
    });

    console.log("Attempting to save product:", product);
    const savedProduct = await product.save();

    // Populate store information before sending response
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("store", "name address")
      .lean();

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.stack,
    });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate("store", "name address")
      .lean();

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

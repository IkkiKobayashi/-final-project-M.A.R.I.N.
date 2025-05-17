const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Product = require("../models/Product");
const User = require("../models/User");
const Store = require("../models/Store");
const generateSKU = require("../utils/skuGenerator");

// Get all products
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;
    let products;
    if (storeId) {
      products = await Product.find({ store: storeId });
    } else {
      products = await Product.find();
    }
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a new product
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { name, price, quantity, expiry, type, image, storeId } = req.body; // Verify user exists
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Verify store exists and user has access
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    // Generate SKU
    let sku;
    try {
      console.log("Attempting to generate SKU for product name:", name);
      if (!name) {
        throw new Error("Product name is required to generate SKU");
      }
      sku = await generateSKU(name);
      console.log("Generated SKU:", sku);
      if (!sku) {
        throw new Error("SKU generation returned null or undefined");
      }
    } catch (skuError) {
      console.error("Error generating SKU:", skuError);
      return res
        .status(400)
        .json({ msg: "Failed to generate product SKU: " + skuError.message });
    }

    // Prevent saving product if SKU is invalid
    if (!sku) {
      return res.status(400).json({ msg: "SKU cannot be null or undefined" });
    }

    // Create and validate the product data
    const productData = {
      name,
      price,
      quantity,
      expiry,
      type,
      image,
      store: storeId,
      sku,
    };

    // Log the complete product data before saving
    console.log(
      "Creating product with data:",
      JSON.stringify(productData, null, 2)
    );

    const product = new Product(productData);
    console.log("Saving product:", product.toObject());
    try {
      const savedProduct = await product.save();
      console.log("Product saved successfully:", savedProduct);
      res.json(savedProduct);
    } catch (saveError) {
      console.error("Error saving product:", saveError);
      // Check for validation errors
      if (saveError.name === "ValidationError") {
        return res.status(400).json({
          msg: "Product validation failed",
          errors: Object.values(saveError.errors).map((err) => err.message),
        });
      }
      // Check for duplicate key errors
      if (saveError.code === 11000) {
        return res.status(400).json({
          msg: "Product with this SKU already exists",
          field: Object.keys(saveError.keyPattern)[0],
        });
      }
      res
        .status(500)
        .json({ msg: "Failed to save product: " + saveError.message });
    }
  } catch (err) {
    console.error("Error in product creation:", err);
    res.status(500).json({ msg: "Server error while creating product" });
  }
});

// Get a product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update a product
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, price, quantity, expiry, type, image, storeId } = req.body;

    // Verify user exists
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Verify store exists and user has access
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.expiry = expiry || product.expiry;
    product.type = type || product.type;
    product.image = image || product.image;
    product.store = storeId || product.store;

    console.log("Updating product:", product);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(400).json({ msg: err.message });
  }
});

// Delete a product
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    await product.remove();
    res.json({ msg: "Product removed" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

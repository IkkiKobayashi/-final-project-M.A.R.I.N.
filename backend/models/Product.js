const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    expiry: {
      type: String,
      required: [true, "Expiry date is required"],
    },
    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: ["food", "electronics", "household", "personal-care"],
    },
    image: {
      type: String,
      default: "img/placeholder-product.png",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store ID is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      // Remove the strict validation for now
    },
  },
  {
    timestamps: true,
  }
);

// Add pre-save middleware for validation and logging
productSchema.pre("save", async function (next) {
  try {
    console.log("Pre-save validation for product:", this.toObject());

    if (this.isModified("name") || !this.sku) {
      const generateSKU = require("../utils/skuGenerator");
      try {
        this.sku = await generateSKU(this.name);
        console.log("Generated new SKU:", this.sku);
      } catch (error) {
        console.error("Error generating SKU:", error);
        // Generate a fallback SKU if the generator fails
        this.sku = `PRD${Date.now().toString().slice(-6)}`;
        console.log("Using fallback SKU:", this.sku);
      }
    }

    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});

// Add post-save middleware for logging
productSchema.post("save", function (doc) {
  console.log("Product saved successfully:", doc);
});

// Add error handling for find operations
productSchema.post("find", function (error, docs, next) {
  if (error) {
    console.error("Error in find operation:", error);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model("Product", productSchema);

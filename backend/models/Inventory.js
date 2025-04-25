const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 10,
    },
    maxStockLevel: {
      type: Number,
      required: true,
      default: 100,
    },
    location: {
      aisle: String,
      shelf: String,
      bin: String,
    },
    lastRestocked: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "in_stock",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique product-store combination
inventorySchema.index({ product: 1, store: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);

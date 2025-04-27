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
      min: 0,
      default: 0,
    },
    batchNumber: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    location: {
      aisle: String,
      shelf: String,
      bin: String,
    },
    status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "expired", "near_expiry"],
      default: "in_stock",
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique product-store-batch combination
inventorySchema.index(
  { product: 1, store: 1, batchNumber: 1 },
  { unique: true }
);

// Create compound index for efficient querying
inventorySchema.index({ store: 1, status: 1 });
inventorySchema.index({ expiryDate: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);

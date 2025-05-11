const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued"],
      default: "active",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRestocked: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ store: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: "text", description: "text" });

// Virtual for stock status
productSchema.virtual("stockStatus").get(function () {
  if (this.stock <= 0) return "out_of_stock";
  if (this.stock <= this.reorderPoint) return "low_stock";
  return "in_stock";
});

// Method to check if product needs restocking
productSchema.methods.needsRestock = function () {
  return this.stock <= this.reorderPoint;
};

module.exports = mongoose.model("Product", productSchema);

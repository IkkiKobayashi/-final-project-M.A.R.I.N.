const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
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
    unit: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/200x200",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "discontinued", "out_of_stock"],
      default: "active",
    },
    threshold: {
      type: Number,
      default: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
productSchema.index({ name: "text", description: "text", sku: "text" });

module.exports = mongoose.model("Product", productSchema);

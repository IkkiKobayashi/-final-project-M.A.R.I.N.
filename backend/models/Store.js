const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    inventory: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
storeSchema.index({ code: 1 }, { unique: true });
storeSchema.index({ owner: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ "inventory.product": 1 });

// Virtual for total products
storeSchema.virtual("totalProducts").get(function () {
  return this.products.length;
});

// Virtual for total inventory value
storeSchema.virtual("totalInventoryValue").get(function () {
  return this.inventory.reduce((total, item) => {
    return total + (item.quantity || 0);
  }, 0);
});

module.exports = mongoose.model("Store", storeSchema);

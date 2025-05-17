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
      default: "img/default-product.png",
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
      validate: {
        validator: function (v) {
          return /^[A-Z]{3}\d{4}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid SKU format! SKU must be 3 uppercase letters followed by 4 digits.`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add pre-save middleware for validation and logging
productSchema.pre("save", async function (next) {
  console.log("Pre-save validation for product:", this.toObject());

  if (this.isModified("name") || !this.sku) {
    const generateSKU = require("../utils/skuGenerator");
    try {
      this.sku = await generateSKU(this.name);
      console.log("Generated new SKU:", this.sku);
    } catch (error) {
      console.error("Error generating SKU:", error);
      next(error);
      return;
    }
  }

  next();
});

// Add post-save middleware for logging
productSchema.post("save", function (doc) {
  console.log("Product saved successfully:", doc);
});

module.exports = mongoose.model("Product", productSchema);

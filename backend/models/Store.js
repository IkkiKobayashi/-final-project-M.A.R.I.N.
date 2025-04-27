const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/400x200",
    },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    settings: {
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      expiryWarningDays: {
        type: Number,
        default: 30,
      },
      notificationPreferences: {
        lowStock: { type: Boolean, default: true },
        expiryWarning: { type: Boolean, default: true },
        activityAlerts: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Store", storeSchema);

const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    layout: {
      type: String,
      enum: ["grid", "list", "custom"],
      default: "grid",
    },
    widgets: [
      {
        type: {
          type: String,
          enum: [
            "inventory",
            "sales",
            "products",
            "activity",
            "alerts",
            "custom",
          ],
          required: true,
        },
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        config: {
          type: Map,
          of: mongoose.Schema.Types.Mixed,
        },
        isVisible: {
          type: Boolean,
          default: true,
        },
      },
    ],
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    refreshInterval: {
      type: Number, // in minutes
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-store combination
dashboardSchema.index({ user: 1, store: 1 }, { unique: true });

module.exports = mongoose.model("Dashboard", dashboardSchema);

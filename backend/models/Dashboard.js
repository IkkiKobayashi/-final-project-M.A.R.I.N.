const mongoose = require("mongoose");

const widgetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["inventory", "sales", "products", "activity", "alerts", "employees"],
    required: true,
  },
  position: {
    x: Number,
    y: Number,
  },
  size: {
    width: { type: Number, default: 1 },
    height: { type: Number, default: 1 },
  },
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
});

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
      required: true,
    },
    layout: {
      type: String,
      enum: ["grid", "list", "compact"],
      default: "grid",
    },
    widgets: [widgetSchema],
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light",
    },
    refreshInterval: {
      type: Number, // in seconds
      default: 300, // 5 minutes
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-store combination
dashboardSchema.index({ user: 1, store: 1 }, { unique: true });

module.exports = mongoose.model("Dashboard", dashboardSchema);

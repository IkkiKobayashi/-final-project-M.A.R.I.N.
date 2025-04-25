const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["inventory", "product", "user", "store", "system"],
      required: true,
    },
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ store: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);

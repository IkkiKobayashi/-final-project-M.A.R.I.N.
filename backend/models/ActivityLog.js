const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
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
    action: {
      type: String,
      enum: ["add", "edit", "delete", "view", "login", "logout", "other"],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["product", "inventory", "employee", "store", "user", "system"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient filtering and searching
activityLogSchema.index({ store: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, entityType: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);

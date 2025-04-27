const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema({
  email: {
    lowStock: { type: Boolean, default: true },
    expiringItems: { type: Boolean, default: true },
    activityAlerts: { type: Boolean, default: true },
  },
  push: {
    lowStock: { type: Boolean, default: true },
    expiringItems: { type: Boolean, default: true },
    activityAlerts: { type: Boolean, default: true },
  },
  threshold: {
    lowStock: { type: Number, default: 10 },
    expiryWarningDays: { type: Number, default: 30 },
  },
});

const settingsSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: ["global", "store", "user"],
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: function () {
        return this.scope === "store";
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.scope === "user";
      },
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      default: "en",
    },
    dateFormat: {
      type: String,
      default: "MM/DD/YYYY",
    },
    timeFormat: {
      type: String,
      default: "12h",
    },
    currency: {
      type: String,
      default: "USD",
    },
    notifications: notificationSettingsSchema,
    inventory: {
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      expiryWarningDays: {
        type: Number,
        default: 30,
      },
      autoReorderEnabled: {
        type: Boolean,
        default: false,
      },
      autoReorderThreshold: {
        type: Number,
        default: 5,
      },
    },
    security: {
      mfaEnabled: {
        type: Boolean,
        default: false,
      },
      sessionTimeout: {
        type: Number,
        default: 30, // minutes
      },
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: true },
        requireUppercase: { type: Boolean, default: true },
        expiryDays: { type: Number, default: 90 },
      },
    },
    customization: {
      logo: String,
      colors: {
        primary: { type: String, default: "#3B82F6" },
        secondary: { type: String, default: "#6B7280" },
        accent: { type: String, default: "#10B981" },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combinations based on scope
settingsSchema.index(
  { scope: 1, store: 1 },
  {
    unique: true,
    partialFilterExpression: { scope: "store" },
  }
);

settingsSchema.index(
  { scope: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { scope: "user" },
  }
);

settingsSchema.index(
  { scope: 1 },
  {
    unique: true,
    partialFilterExpression: { scope: "global" },
  }
);

module.exports = mongoose.model("Settings", settingsSchema);

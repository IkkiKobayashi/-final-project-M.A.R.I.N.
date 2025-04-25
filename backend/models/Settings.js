const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    company: {
      name: String,
      logo: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
      contact: {
        phone: String,
        email: String,
        website: String,
      },
    },
    inventory: {
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      autoReorder: {
        type: Boolean,
        default: false,
      },
      defaultReorderQuantity: {
        type: Number,
        default: 50,
      },
    },
    notifications: {
      email: {
        lowStock: Boolean,
        newOrder: Boolean,
        systemAlerts: Boolean,
      },
      sms: {
        lowStock: Boolean,
        newOrder: Boolean,
        systemAlerts: Boolean,
      },
    },
    security: {
      passwordPolicy: {
        minLength: Number,
        requireSpecialChar: Boolean,
        requireNumber: Boolean,
        requireUppercase: Boolean,
      },
      sessionTimeout: Number, // in minutes
      maxLoginAttempts: Number,
    },
    theme: {
      primaryColor: String,
      secondaryColor: String,
      darkMode: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);

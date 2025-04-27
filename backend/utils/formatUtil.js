const currency = require("currency.js");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

class FormatUtil {
  // Format currency
  static formatCurrency(amount, currencyCode = "USD") {
    return currency(amount, {
      symbol: this.getCurrencySymbol(currencyCode),
      precision: 2,
    }).format();
  }

  // Get currency symbol
  static getCurrencySymbol(currencyCode) {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      // Add more currencies as needed
    };
    return symbols[currencyCode] || currencyCode;
  }

  // Format date
  static formatDate(date, format = "YYYY-MM-DD") {
    return dayjs(date).format(format);
  }

  // Format time
  static formatTime(date, format = "HH:mm:ss") {
    return dayjs(date).format(format);
  }

  // Format datetime
  static formatDateTime(date, format = "YYYY-MM-DD HH:mm:ss") {
    return dayjs(date).format(format);
  }

  // Get relative time
  static getRelativeTime(date) {
    return dayjs(date).fromNow();
  }

  // Format file size
  static formatFileSize(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Format number with commas
  static formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Format percentage
  static formatPercentage(value, decimals = 2) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  // Format phone number
  static formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  }

  // Format duration in milliseconds to human readable
  static formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Format status to display text
  static formatStatus(status) {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Truncate text with ellipsis
  static truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + "...";
  }

  // Format object ID to short version
  static formatShortId(objectId) {
    return objectId.toString().substr(-6).toUpperCase();
  }

  // Convert camelCase to Title Case
  static camelToTitleCase(camelCase) {
    return camelCase
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  }

  // Format activity type for display
  static formatActivityType(type) {
    const types = {
      product_add: "Added Product",
      product_update: "Updated Product",
      product_delete: "Deleted Product",
      inventory_add: "Added Inventory",
      inventory_update: "Updated Inventory",
      inventory_remove: "Removed Inventory",
      user_login: "User Login",
      user_logout: "User Logout",
      // Add more types as needed
    };
    return types[type] || this.camelToTitleCase(type);
  }

  // Format response data for API
  static formatApiResponse(data, message = "Success", status = 200) {
    return {
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  // Format error response for API
  static formatApiError(error, status = 500) {
    return {
      status,
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = FormatUtil;

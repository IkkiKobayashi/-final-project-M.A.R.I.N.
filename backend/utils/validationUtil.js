const validator = require("validator");

class ValidationUtil {
  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  static isStrongPassword(password) {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  }

  static sanitizeString(str) {
    return validator.escape(str.trim());
  }

  static isValidPhoneNumber(phone) {
    return validator.isMobilePhone(phone);
  }

  static isValidDate(date) {
    return validator.isISO8601(date);
  }

  static validateProductData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Product name must be at least 2 characters long");
    }

    if (!data.sku || !validator.isAlphanumeric(data.sku)) {
      errors.push("SKU must contain only letters and numbers");
    }

    if (data.sku && !validator.matches(data.sku, /^[A-Z]{3}\d{4}$/)) {
      errors.push("SKU must be in format XXX0000");
    }

    if (!data.price || !validator.isFloat(data.price.toString(), { min: 0 })) {
      errors.push("Price must be a positive number");
    }

    if (
      data.threshold &&
      !validator.isInt(data.threshold.toString(), { min: 0 })
    ) {
      errors.push("Threshold must be a positive integer");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateInventoryData(data) {
    const errors = [];

    if (
      !data.quantity ||
      !validator.isInt(data.quantity.toString(), { min: 0 })
    ) {
      errors.push("Quantity must be a positive integer");
    }

    if (!data.batchNumber || !validator.isAlphanumeric(data.batchNumber)) {
      errors.push("Batch number must contain only letters and numbers");
    }

    if (data.expiryDate && !this.isValidDate(data.expiryDate)) {
      errors.push("Invalid expiry date format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateStoreData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Store name must be at least 2 characters long");
    }

    if (!data.code || !validator.isAlphanumeric(data.code)) {
      errors.push("Store code must contain only letters and numbers");
    }

    if (data.contact) {
      if (data.contact.email && !this.isValidEmail(data.contact.email)) {
        errors.push("Invalid store email address");
      }
      if (data.contact.phone && !this.isValidPhoneNumber(data.contact.phone)) {
        errors.push("Invalid store phone number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateEmployeeData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Invalid email address");
    }

    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      errors.push("Invalid phone number");
    }

    if (!["admin", "manager", "employee"].includes(data.role)) {
      errors.push("Invalid role specified");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSupportTicketData(data) {
    const errors = [];

    if (!data.subject || data.subject.trim().length < 5) {
      errors.push("Subject must be at least 5 characters long");
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (
      !["technical", "access", "inventory", "billing", "other"].includes(
        data.category
      )
    ) {
      errors.push("Invalid ticket category");
    }

    if (!["low", "medium", "high", "urgent"].includes(data.priority)) {
      errors.push("Invalid priority level");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = ValidationUtil;

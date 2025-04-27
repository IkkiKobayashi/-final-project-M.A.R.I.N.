const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const xss = require("xss");
const config = require("../config/config");
const LoggingUtil = require("./loggingUtil");

class SecurityUtil {
  // Hash password
  static async hashPassword(password) {
    return bcrypt.hash(password, config.security.bcryptSaltRounds);
  }

  // Compare password with hash
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  // Generate access token
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  // Generate refresh token
  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      LoggingUtil.error("Token verification failed", error);
      return null;
    }
  }

  // Generate random token
  static generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }

  // Generate reset password token
  static generateResetToken(userId) {
    const resetToken = this.generateRandomToken();
    const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

    return {
      resetToken,
      hash,
      expires: Date.now() + 3600000, // 1 hour
    };
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input === "string") {
      return xss(input.trim());
    }
    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item));
    }
    if (typeof input === "object" && input !== null) {
      const sanitizedObj = {};
      for (const key in input) {
        sanitizedObj[key] = this.sanitizeInput(input[key]);
      }
      return sanitizedObj;
    }
    return input;
  }

  // Generate secure random string
  static generateSecureString(length = 16) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const randomBytes = crypto.randomBytes(length);
    const result = new Array(length);
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
      result[i] = chars[randomBytes[i] % charsLength];
    }

    return result.join("");
  }

  // Rate limiting key generator
  static generateRateLimitKey(req) {
    return `${req.ip}-${req.path}`;
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase)
      errors.push("Password must contain at least one uppercase letter");
    if (!hasLowerCase)
      errors.push("Password must contain at least one lowercase letter");
    if (!hasNumbers) errors.push("Password must contain at least one number");
    if (!hasSpecialChars)
      errors.push("Password must contain at least one special character");

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Generate API key
  static generateApiKey() {
    const prefix = "marin";
    const random = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now().toString(36);
    return `${prefix}_${random}_${timestamp}`;
  }

  // Hash sensitive data (for logging/storage)
  static hashSensitiveData(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // Encrypt data
  static encryptData(data, key = config.security.encryptionKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  }

  // Decrypt data
  static decryptData(data, key = config.security.encryptionKey) {
    const [ivHex, encryptedHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(key),
      iv
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  }

  // Validate request origin
  static validateOrigin(origin) {
    const allowedOrigins = [
      config.server.frontendUrl,
      // Add more allowed origins as needed
    ];
    return allowedOrigins.includes(origin);
  }

  // Generate CSP nonce
  static generateCspNonce() {
    return crypto.randomBytes(16).toString("base64");
  }
}

module.exports = SecurityUtil;

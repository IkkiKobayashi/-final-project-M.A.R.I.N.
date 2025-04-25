require("dotenv").config();

module.exports = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database Configuration
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/restaurant-management",

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB in bytes
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

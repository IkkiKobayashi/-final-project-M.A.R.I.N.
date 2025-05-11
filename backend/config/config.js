require("dotenv").config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    apiUrl: process.env.API_URL || "http://localhost:3000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5500",
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME || "marin_db",
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
      maxPoolSize: 50,
      minPoolSize: 10,
      connectTimeoutMS: 10000,
      retryReads: true,
      autoIndex: process.env.NODE_ENV === "development",
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // File upload configuration
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    directory: process.env.UPLOAD_DIR || "uploads/",
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || "noreply@marin.com",
  },

  // Security configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    corsOptions: {
      origin: process.env.FRONTEND_URL || "http://localhost:5500",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },
  },

  // Activity logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    file: process.env.LOG_FILE || "logs/app.log",
    maxSize: process.env.LOG_MAX_SIZE || "10m",
    maxFiles: process.env.LOG_MAX_FILES || "7d",
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 60, // seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 120, // seconds
  },

  // Notification configuration
  notifications: {
    enabled: process.env.NOTIFICATIONS_ENABLED === "true",
    providers: {
      email: {
        enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === "true",
        templates: {
          directory: "templates/email/",
        },
      },
      push: {
        enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === "true",
        vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
      },
    },
  },
};

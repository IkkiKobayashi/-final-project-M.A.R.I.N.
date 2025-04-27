const winston = require("winston");
const config = require("../config/config");

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write logs to file
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }),
    // Write errors to separate file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }),
  ],
});

// Add console logging in development
if (config.server.env === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

class LoggingUtil {
  static info(message, meta = {}) {
    logger.info(message, { ...meta, timestamp: new Date() });
  }

  static error(message, error = null, meta = {}) {
    logger.error(message, {
      ...meta,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            code: error.code,
          }
        : null,
      timestamp: new Date(),
    });
  }

  static warn(message, meta = {}) {
    logger.warn(message, { ...meta, timestamp: new Date() });
  }

  static debug(message, meta = {}) {
    logger.debug(message, { ...meta, timestamp: new Date() });
  }

  static logAPIRequest(req, res, next) {
    const startTime = Date.now();

    // Log request
    logger.info("API Request", {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      userIp: req.ip,
      userId: req.user?.userId,
      userRole: req.user?.role,
    });

    // Log response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info("API Response", {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        userId: req.user?.userId,
      });
    });

    next();
  }

  static logError(err, req, res, next) {
    logger.error("Unhandled Error", {
      error: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      request: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        userIp: req.ip,
        userId: req.user?.userId,
        userRole: req.user?.role,
      },
    });

    next(err);
  }

  static logDatabaseOperation(
    operation,
    collection,
    query,
    duration,
    error = null
  ) {
    const logData = {
      operation,
      collection,
      query,
      duration,
      timestamp: new Date(),
    };

    if (error) {
      logger.error("Database Operation Error", {
        ...logData,
        error: {
          message: error.message,
          code: error.code,
        },
      });
    } else {
      logger.debug("Database Operation", logData);
    }
  }

  static logAuthAttempt(success, userId, ip, reason = null) {
    const logData = {
      success,
      userId,
      ip,
      timestamp: new Date(),
    };

    if (!success && reason) {
      logData.failureReason = reason;
    }

    logger.info("Authentication Attempt", logData);
  }

  static logSystemEvent(eventType, details, meta = {}) {
    logger.info("System Event", {
      eventType,
      details,
      ...meta,
      timestamp: new Date(),
    });
  }

  static async getRecentLogs(options = {}) {
    const { level = "info", limit = 100, startDate, endDate } = options;

    return new Promise((resolve, reject) => {
      const query = {};

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      if (level !== "all") {
        query.level = level;
      }

      // Read from log file and parse entries
      const logs = [];
      logger.query(query, { limit }, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = LoggingUtil;

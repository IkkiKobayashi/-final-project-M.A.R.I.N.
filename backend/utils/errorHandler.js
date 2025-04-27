const LoggingUtil = require("./loggingUtil");
const FormatUtil = require("./formatUtil");
const config = require("../config/config");

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  static handleError(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Log error
    LoggingUtil.error("Application Error", err, {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user,
    });

    if (config.server.env === "development") {
      this.sendDevError(err, req, res);
    } else {
      this.sendProdError(err, req, res);
    }
  }

  static handleDatabaseError(err) {
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => error.message);
      return new AppError("Validation Error: " + errors.join(", "), 400);
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return new AppError(`Duplicate ${field}. Please use another value.`, 400);
    }

    // Handle cast errors
    if (err.name === "CastError") {
      return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    // Default database error
    return new AppError("Database operation failed", 500);
  }

  static handleAuthError(err) {
    if (err.name === "JsonWebTokenError") {
      return new AppError("Invalid token. Please log in again.", 401);
    }

    if (err.name === "TokenExpiredError") {
      return new AppError("Token expired. Please log in again.", 401);
    }

    return new AppError("Authentication failed", 401);
  }

  static handleValidationError(err) {
    if (!Array.isArray(err)) {
      err = [err];
    }

    const formattedErrors = err.map((e) => ({
      field: e.field || "general",
      message: e.message,
    }));

    return new AppError("Validation failed", 400, {
      code: "VALIDATION_ERROR",
      errors: formattedErrors,
    });
  }

  static async handleAsyncError(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }

  static sendDevError(err, req, res) {
    res.status(err.statusCode).json(
      FormatUtil.formatApiError(
        {
          status: err.status,
          message: err.message,
          errorCode: err.errorCode,
          error: err,
          stack: err.stack,
          requestBody: req.body,
        },
        err.statusCode
      )
    );
  }

  static sendProdError(err, req, res) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json(
        FormatUtil.formatApiError(
          {
            status: err.status,
            message: err.message,
            errorCode: err.errorCode,
          },
          err.statusCode
        )
      );
    }

    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);
    res.status(500).json(
      FormatUtil.formatApiError(
        {
          status: "error",
          message: "Something went wrong!",
        },
        500
      )
    );
  }

  static notFound(req, res, next) {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
  }

  static methodNotAllowed(req, res) {
    throw new AppError(
      `${req.method} method is not supported for this route`,
      405
    );
  }

  // Custom error types
  static get ErrorTypes() {
    return {
      VALIDATION_ERROR: "ValidationError",
      AUTHENTICATION_ERROR: "AuthenticationError",
      AUTHORIZATION_ERROR: "AuthorizationError",
      NOT_FOUND_ERROR: "NotFoundError",
      CONFLICT_ERROR: "ConflictError",
      RATE_LIMIT_ERROR: "RateLimitError",
      INTERNAL_ERROR: "InternalError",
    };
  }

  // Error factory methods
  static validation(message, errors) {
    return new AppError(message, 400, {
      type: this.ErrorTypes.VALIDATION_ERROR,
      errors,
    });
  }

  static authentication(message) {
    return new AppError(message, 401, {
      type: this.ErrorTypes.AUTHENTICATION_ERROR,
    });
  }

  static authorization(message) {
    return new AppError(message, 403, {
      type: this.ErrorTypes.AUTHORIZATION_ERROR,
    });
  }

  static notFoundError(message) {
    return new AppError(message, 404, {
      type: this.ErrorTypes.NOT_FOUND_ERROR,
    });
  }

  static conflict(message) {
    return new AppError(message, 409, {
      type: this.ErrorTypes.CONFLICT_ERROR,
    });
  }

  static rateLimit(message) {
    return new AppError(message, 429, {
      type: this.ErrorTypes.RATE_LIMIT_ERROR,
    });
  }

  static internal(message) {
    return new AppError(message || "An unexpected error occurred", 500, {
      type: this.ErrorTypes.INTERNAL_ERROR,
    });
  }
}

module.exports = {
  AppError,
  ErrorHandler,
};

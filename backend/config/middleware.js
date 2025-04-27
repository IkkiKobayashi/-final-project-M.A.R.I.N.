const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Configure middleware
module.exports = (app) => {
  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5500",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging in development
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Compression
  app.use(compression());

  // Rate limiting
  app.use("/api/", limiter);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);

    // Handling specific types of errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
        error: err.message,
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        error: err.message,
      });
    }

    // Default error
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: "Route not found",
    });
  });
};

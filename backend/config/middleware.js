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
      origin:
        process.env.NODE_ENV === "development"
          ? "*"
          : ["http://localhost:5500", "http://127.0.0.1:5500"], // Allow all origins in development
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Request parsing with increased limits
  app.use(
    express.json({
      limit: "50mb",
      parameterLimit: 100000,
      extended: true,
    })
  );
  app.use(
    express.urlencoded({
      limit: "50mb",
      parameterLimit: 100000,
      extended: true,
    })
  );

  // Logging in development
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Compression
  app.use(compression());

  // Rate limiting
  app.use("/api/", limiter);
};

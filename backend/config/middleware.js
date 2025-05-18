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
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://final-project-m-a-r-i-n.onrender.com",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Request parsing
  app.use(
    express.json({
      limit: "50mb",
    })
  );
  app.use(
    express.urlencoded({
      extended: true,
      limit: "50mb",
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

  // Error catching middleware
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ message: "Invalid JSON payload" });
    }
    if (err instanceof URIError) {
      return res.status(400).json({ message: "Invalid URL" });
    }
    next(err);
  });
};

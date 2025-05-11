require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const config = require("./config/config");
const connectDB = require("./config/db");
const configureMiddleware = require("./config/middleware");
const { ErrorHandler } = require("./utils/errorHandler");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");

// Import models
const Product = require("./models/Product"); // Assuming Product model is defined

// Initialize express app
const app = express();

// Configure middleware
configureMiddleware(app);

// Connect to MongoDB Atlas
connectDB()
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
    startServer();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

function startServer() {
  // Static file serving
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/stores", storeRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/activity", activityLogRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/support", supportTicketRoutes);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date(),
      uptime: process.uptime(),
      mongoConnection:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  // 404 handler (must be after all routes)
  app.use((req, res, next) => {
    next(
      ErrorHandler.notFoundError(
        `Cannot find ${req.originalUrl} on this server!`
      )
    );
  });

  // Global error handler
  app.use((err, req, res, next) => {
    if (err instanceof ErrorHandler.AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errorCode: err.errorCode,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      });
    }

    // Handle mongoose errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: Object.values(err.errors).map((e) => e.message),
      });
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // Default error
    console.error("Unhandled Error:", err);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // Start server
  const PORT = process.env.PORT || config.server.port;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.server.env} mode on port ${PORT}`);
    console.log(`API URL: ${config.server.apiUrl}`);
  });

  // Graceful shutdown handlers
  const shutdown = async () => {
    console.log("Initiating graceful shutdown...");
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Unhandled rejection handler
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

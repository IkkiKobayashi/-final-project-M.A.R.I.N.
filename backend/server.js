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

// Initialize express app
const app = express();

// Configure middleware
configureMiddleware(app);

// Basic middleware with increased limits
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

// Configure other middleware
app.use(cookieParser());

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const supportTicketRoutes = require("./routes/supportTicketRoutes");

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
  // API Routes - More specific routes first
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/stores", storeRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/support", supportTicketRoutes);

  // Static file serving for frontend - Move this after API routes
  app.use(express.static(path.join(__dirname, "../frontend")));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Error handling middleware
  app.use(ErrorHandler.handleError);

  // Handle 404s
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ message: "API endpoint not found" });
    } else {
      res.sendFile(path.join(__dirname, "../frontend", "login.html"));
    }
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
  process.exit(1);
});

const express = require("express");
const config = require("./config/config");
const connectDB = require("./config/db");
const configureMiddleware = require("./config/middleware");
const path = require("path");

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

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure middleware
configureMiddleware(app);

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
  });
});

// Global error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Graceful shutdown
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

// Graceful shutdown handlers
const shutdown = async () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server with error handling
const PORT = config.server.port;
const server = app
  .listen(PORT, () => {
    console.log(
      `Server is running in ${config.server.env} mode on port ${PORT}`
    );
    console.log(`API URL: ${config.server.apiUrl}`);
  })
  .on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });

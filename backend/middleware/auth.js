const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ErrorHandler } = require("../utils/errorHandler");

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return next(
        ErrorHandler.authentication("No token, authorization denied")
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(ErrorHandler.authentication("User not found"));
      }

      if (!user.isActive) {
        return next(ErrorHandler.authentication("User account is inactive"));
      }

      req.user = {
        userId: user._id,
        role: user.role,
        store: user.store,
        lastActive: new Date(),
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return next(
          ErrorHandler.authentication("Token expired. Please log in again.")
        );
      }
      return next(ErrorHandler.authentication("Invalid token"));
    }
  } catch (error) {
    next(ErrorHandler.internal("Authentication error"));
  }
};

// Role-based access control middleware
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        ErrorHandler.authorization("Access denied: insufficient permissions")
      );
    }
    next();
  };
};

// Store access middleware
exports.checkStoreAccess = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;

    // Admins have access to all stores
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user belongs to the store
    if (req.user.store?.toString() !== storeId) {
      return next(
        ErrorHandler.authorization(
          "Access denied: you don't have access to this store"
        )
      );
    }

    next();
  } catch (error) {
    next(ErrorHandler.internal("Store access check failed"));
  }
};

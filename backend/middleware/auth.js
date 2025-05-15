const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ErrorHandler } = require("../utils/errorHandler");

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
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

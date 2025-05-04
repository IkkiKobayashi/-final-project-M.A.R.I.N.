const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware
exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
          code: "AUTH_USER_NOT_FOUND",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          message: "User account is inactive",
          code: "AUTH_USER_INACTIVE",
        });
      }

      req.user = {
        userId: user._id,
        role: user.role,
        store: user.store,
        lastActive: new Date(),
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Internal server error",
      code: "AUTH_INTERNAL_ERROR",
    });
  }
};

// Role-based access control middleware
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
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
      return res.status(403).json({
        message: "Access denied: you don't have access to this store",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

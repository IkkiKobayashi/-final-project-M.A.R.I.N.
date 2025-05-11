const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../utils/errorHandler");
const config = require("../config/config");
const crypto = require("crypto");

// Generate tokens
const generateTokens = async (user, req) => {
  // Generate access token
  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: config.jwt.expiresIn,
  });

  // Generate refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Save refresh token
  await new RefreshToken({
    token: refreshToken,
    user: user._id,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  }).save();

  return { accessToken, refreshToken };
};

exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next(ErrorHandler.conflict("Email or username already exists"));
    }

    const user = new User({
      fullName,
      email,
      username,
      password,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, req);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return next(ErrorHandler.authentication("Invalid credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(ErrorHandler.authentication("Invalid credentials"));
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user, req);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(ErrorHandler.authentication("Refresh token is required"));
    }

    // Find refresh token in database
    const tokenDoc = await RefreshToken.findOne({
      token: refreshToken,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return next(ErrorHandler.authentication("Invalid refresh token"));
    }

    // Get user
    const user = await User.findById(tokenDoc.user).select("-password");
    if (!user) {
      return next(ErrorHandler.authentication("User not found"));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user,
      req
    );

    // Revoke old refresh token
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedBy = newRefreshToken;
    await tokenDoc.save();

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revokedAt: new Date() }
      );

      // Clear refresh token cookie
      res.clearCookie("refreshToken");
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(ErrorHandler.handleDatabaseError(error));
  }
};

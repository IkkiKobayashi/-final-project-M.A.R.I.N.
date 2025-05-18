const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists by username instead of email
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh token
exports.refreshToken = (req, res) => {
  // Implement refresh token logic here
  res.json({ message: "Refresh token route works!" });
};

// Logout user
exports.logout = (req, res) => {
  // Implement logout logic here
  res.json({ message: "Logout route works!" });
};

// Signup user
exports.signup = async (req, res) => {
  try {
    const { name, email, username, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // Handle profile image
    let profileImagePath = "img/user img/store admin.jpg"; // Default image
    if (req.file) {
      // Get the relative path for storage
      const relativePath = path.relative(
        path.join(__dirname, "../uploads"),
        req.file.path
      );
      profileImagePath = relativePath.replace(/\\/g, "/"); // Convert Windows path to URL format
    }

    // Create new user with admin role
    const user = new User({
      name,
      email,
      username,
      password,
      phone,
      address,
      profileImage: profileImagePath,
      role: "admin", // Set role as admin for signup
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

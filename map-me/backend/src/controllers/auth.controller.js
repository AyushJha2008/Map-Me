// controllers/auth.controller.js
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Utility to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } // short expiry
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" } // longer expiry
  );

  return { accessToken, refreshToken };
};

// ====== Register Organizer ======
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Organizer registered successfully",
      data: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Login Organizer ======
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens in cookie + response
    res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
      .json({
        success: true,
        message: "Login successful",
        data: { id: user._id, fullName: user.fullName, email: user.email },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Logout Organizer ======
export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    user.refreshToken = null;
    await user.save();

    res.clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Refresh Token ======
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: false })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: false })
      .json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
};

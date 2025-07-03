import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const validateSignup = (req, res, next) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^[\p{L} '-]+$/u.test(fullName)) {
    return res.status(400).json({
      message:
        "Full name may only contain letters, spaces, hyphens, or apostrophes",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!validator.isLength(password, { min: 6 })) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  // Overwrite the body with trimmed & normalized data
  req.body.fullName = fullName;
  req.body.email = email;

  next();
};

export const validateLogin = (req, res, next) => {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  req.body.email = email;

  next();
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No Token Provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - Invalid Token",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("Error in protectRoute middleware:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

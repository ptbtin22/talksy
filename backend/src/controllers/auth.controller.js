import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken, sanitizeUser } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      return res.status(201).json(sanitizeUser(newUser));
    }

    return res.status(400).json({
      message: "Invalid user data",
    });
  } catch (err) {
    console.error("Error: ", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    generateToken(user._id, res);

    return res.status(200).json(sanitizeUser(user));
  } catch (err) {
    console.error(err);
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (err) {
    console.error("Error: ", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    // Handle remove request first
    if (req.body.remove === "true") {
      req.user.profilePicture = "";
      await req.user.save();

      return res.status(200).json({
        message: "Profile picture removed successfully",
        updatedUser: req.user.toObject(),
      });
    }

    // Handle image upload if a file is provided
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "talksy/profile_pictures" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ message: "Upload failed" });
          }

          req.user.profilePicture = result.secure_url;
          await req.user.save();

          return res.status(200).json({
            message: "Profile picture updated successfully",
            updatedUser: req.user.toObject(),
          });
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      return res.status(400).json({ message: "No image file provided" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    console.error("Error: ", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

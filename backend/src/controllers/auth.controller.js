import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

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
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      });
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

export const login = (req, res) => {
  const { email, password } = req.body;

  try {
  } catch (err) {
    console.error(err);
  }
};

export const logout = (req, res) => {
  res.send("Sign Up Page");
};

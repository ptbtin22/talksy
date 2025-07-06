import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password -__v"
    );

    return res.status(200).json(users);
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;

    const myUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myUserId },
      ],
    });
    // .sort({ createdAt: 1 })
    // .populate("receiverId", "-password -__v")
    // .populate("senderId", "-password -__v");

    return res.status(200).json(messages);
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text } = req.body;

    if (!text && !req.file) {
      return res.status(400).json({
        message: "Message text or image is required",
      });
    }

    let imageUrl;

    if (req.file) {
      const result = cloudinary.uploader.upload_stream(
        { folder: "talksy/messages" },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              message: "Failed to upload image",
            });
          }

          imageUrl = result.secure_url;

          const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            text,
            image: imageUrl,
          });

          return res.status(201).json(message);
        }
      );

      result.end(req.file.buffer);
    } else {
      const message = await Message.create({
        senderId: req.user._id,
        receiverId,
        text,
      });

      return res.status(201).json(message);
    }
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

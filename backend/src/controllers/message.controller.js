import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// controllers/message.controller.js
export const getMessagedUsers = async (req, res) => {
  const userId = req.user._id;

  try {
    const recentConversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessageAt: { $first: "$updatedAt" },
        },
      },
      {
        $sort: { lastMessageAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            _id: 1,
            fullName: 1,
            email: 1,
            profilePicture: 1,
          },
          lastMessageAt: 1,
        },
      },
    ]);

    const users = recentConversations.map((conv) => conv.user);
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  const currentUserId = req.user._id;
  const searchQuery = req.query.query;

  let filter = {
    _id: { $ne: currentUserId },
  };

  if (searchQuery) {
    filter.$or = [
      { fullName: { $regex: searchQuery, $options: "i" } },
      { email: { $regex: searchQuery, $options: "i" } },
    ];
  }

  try {
    const query = User.find(filter).select("-password -__v");

    if (searchQuery) {
      query.limit(10);
    }

    const users = await query;

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
    // .sort({ updatedAt: -1 })
    // .limit(10);
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

          const receiverSocketId = getReceiverSocketId(receiverId);

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
          }

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

      const receiverSocketId = getReceiverSocketId(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }

      return res.status(201).json(message);
    }
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

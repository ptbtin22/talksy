import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      // Upload image to cloudinary
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "messages",
      });
      imageUrl = uploadResult.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // TODO: real time functionality goes here => socket.io
    return res.status(201).json(newMessage);
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

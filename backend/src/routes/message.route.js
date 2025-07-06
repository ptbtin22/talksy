import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUsers,
  getMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/users", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage);

export default router;

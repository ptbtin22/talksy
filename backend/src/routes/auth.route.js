import express from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  getUser,
} from "../controllers/auth.controller.js";
import {
  validateLogin,
  validateSignup,
  protectRoute,
} from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePicture"),
  updateProfile
);
router.get("/check", protectRoute, checkAuth);
router.get("/users/:id", getUser);

export default router;

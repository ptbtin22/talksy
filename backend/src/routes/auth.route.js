import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { validateSignup } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;

// routes/auth.routes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ====== Auth Routes ======

// Register organizer
router.post("/register", registerUser);

// Login organizer
router.post("/login", loginUser);

// Logout organizer (secured)
router.post("/logout", verifyJwt, logoutUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

export default router;

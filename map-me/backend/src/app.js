import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ====== Middlewares ======
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // fallback for dev
  credentials: true, // allow cookies & auth headers
}));

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // for images (e.g., room photos)

// ====== Routes Imports ======
import authRouter from "./routes/auth.routes.js";
import mapRouter from "./routes/map.routes.js";

// ====== Routes Declaration ======
app.use("/api/v1/auth", authRouter);   // Authentication
app.use("/api/v1/maps", mapRouter);  // Maps, Floors, Rooms (coming soon)

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Map Me backend is running 🚀" });
});
// app.js (at the bottom, after routes)
import { ApiError } from "./utils/api-err.js";

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  console.error("Unhandled Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


export { app };

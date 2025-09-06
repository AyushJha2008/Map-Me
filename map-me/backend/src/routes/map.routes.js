import { Router } from "express";
import {
  createMap,
  getMaps,
  getMapById,
  updateRoom,
  deleteMap,
} from "../controllers/map.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ====== Map Routes ======

// Create new map
router.post("/", verifyJwt, createMap);

// Get all maps of logged-in organizer
router.get("/", verifyJwt, getMaps);

// Get single map by ID
router.get("/:id", verifyJwt, getMapById);

// Update room info (name, photo, notes)
router.put(
  "/:mapId/floors/:floorNumber/rooms/:roomIndex",
  verifyJwt,
  upload.single("photo"), // 👈 allow photo upload
  updateRoom
);


// Delete map
router.delete("/:id", verifyJwt, deleteMap);

export default router;

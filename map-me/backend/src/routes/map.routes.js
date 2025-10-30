// backend/src/routes/map.routes.js (REPLACE ENTIRE FILE CONTENT)
import { Router } from "express";
import {
  createMap,
  getMaps,
  getMapById,
  updateRoom,
  deleteMap,
  getMapByQrCode,
  // updateFloorFeatures is REMOVED
} from "../controllers/map.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//--- Map Routes ----

// Create new map
router.post("/", verifyJwt, createMap);
// Get all maps of logged-in organizer
router.get("/", verifyJwt, getMaps);

// Get single map by ID (SECURED: for organizers)
router.get("/:id", verifyJwt, getMapById);

// Get single map by ID (PUBLIC: for visitors)
router.get("/visitor/:id", getMapById);

// Search map by QR code (PUBLIC - for Visitors)
router.get("/qr-search/:qrCode", getMapByQrCode);

// The obsolete /features route is REMOVED.

// Update room info (name, photo, notes, and QR code)
router.put(
  "/:mapId/floors/:floorNumber/sections/:sectionIndex/rooms/:roomIndex",
  verifyJwt,
  upload.single("photo"),
  updateRoom
);

// Delete map
router.delete("/:id", verifyJwt, deleteMap);

export default router;
// backend/src/controllers/map.controller.js (REPLACE ENTIRE FILE CONTENT)
import { Map } from "../models/map.model.js";
import { v4 as uuidv4 } from "uuid";

// ====== Create a New Map ======
export const createMap = async (req, res) => {
  try {
    const { title, floors } = req.body;
    const userId = req.user._id;

    if (!title || !floors) {
      return res.status(400).json({
        success: false,
        message: "Title and floors are required",
      });
    }

    // Assign QR codes to rooms and set classification default
    floors.forEach((floor) => {
      floor.sections.forEach((section) => {
        section.rooms.forEach((room) => {
          room.qrCode = uuidv4();
          room.classification = room.classification || 'Normal'; // Set default
        });
      });
    });

    const newMap = await Map.create({
      title,
      createdBy: userId,
      floors,
    });

    res.status(201).json({
      success: true,
      message: "Map created successfully",
      data: newMap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Get Map by QR Code (Public) ======
export const getMapByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    if (!qrCode) {
      return res.status(400).json({ success: false, message: "QR code is required" });
    }

    const map = await Map.aggregate([
      { $unwind: "$floors" },
      { $unwind: "$floors.sections" },
      { $unwind: "$floors.sections.rooms" },
      { $match: { "floors.sections.rooms.qrCode": qrCode } },
      {
        $project: {
          _id: 1,
          title: 1,
          createdBy: 1,
          floors: "$floors",
          matchedRoom: "$floors.sections.rooms",
        }
      },
    ]);

    if (map.length === 0) {
      return res.status(404).json({ success: false, message: "Room not found for this QR code" });
    }
    
    // We get the map ID and the QR code which the frontend will use to fetch the map and highlight the room.
    const mapId = map[0]._id;

    res.json({ 
        success: true, 
        mapId: mapId,
        qrCode: qrCode,
        message: "Room found successfully, proceeding to map view."
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error during QR search." });
  }
};

// ====== Get All Maps of an Organizer ======
export const getMaps = async (req, res) => {
  try {
    const maps = await Map.find({ createdBy: req.user._id });
    res.json({ success: true, data: maps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Get Map by ID ======
export const getMapById = async (req, res) => {
  try {
    const map = await Map.findById(req.params.id);
    if (!map) {
      return res.status(404).json({ success: false, message: "Map not found" });
    }
    res.json({ success: true, data: map });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Update Room Info (Now handles classification) ======
export const updateRoom = async (req, res) => {
  try {
    const { mapId, floorNumber, sectionIndex, roomIndex } = req.params;
    const { name, notes, regenerateQr, classification } = req.body; // 💡 Read new classification
    const photoFile = req.file;

    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({ success: false, message: "Map not found" });
    }

    if (map.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const floor = map.floors.find(f => f.floorNumber === Number(floorNumber));
    if (!floor) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }

    const section = floor.sections[Number(sectionIndex)];
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    
    const room = section.rooms[Number(roomIndex)];
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Update room fields only if provided/changed
    if (name !== undefined) room.name = name;
    if (notes !== undefined) room.notes = notes;
    if (classification !== undefined) room.classification = classification; // 💡 SAVE CLASSIFICATION

    // Handle photo upload
    if (photoFile) {
      room.photo = `/temp/${photoFile.filename}`;
    }

    // Regenerate QR code if requested
    if (regenerateQr === 'true') {
        room.qrCode = uuidv4();
    }

    await map.save();

    res.json({
      success: true,
      message: "Room updated successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ====== Delete Map ======
export const deleteMap = async (req, res) => {
  try {
    const map = await Map.findByIdAndDelete(req.params.id);
    if (!map) return res.status(404).json({ success: false, message: "Map not found" });
    if (map.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    await Map.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: "Map deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// updateFloorFeatures is removed from the file.
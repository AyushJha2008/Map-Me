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

    // Assign QR codes to rooms
    floors.forEach((floor) => {
      floor.sections.forEach((section) => {
        section.rooms.forEach((room) => {
          room.qrCode = uuidv4();
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

// ====== Update Room Info ======
export const updateRoom = async (req, res) => {
  try {
    const { mapId, floorNumber, sectionIndex, roomIndex } = req.params;
    const { name, notes, regenerateQr } = req.body;
    const photoFile = req.file;

    const map = await Map.findById(mapId);
    if (!map) {
      return res.status(404).json({ success: false, message: "Map not found" });
    }

    if (map.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Find floor by converting floorNumber to a number
    const floor = map.floors.find(f => f.floorNumber === Number(floorNumber));
    if (!floor) {
      return res.status(404).json({ success: false, message: "Floor not found" });
    }

    // Find section and room using numeric indices
    const section = floor.sections[Number(sectionIndex)];
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    
    const room = section.rooms[Number(roomIndex)];
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Update room fields only if provided
    if (name !== undefined) room.name = name;
    if (notes !== undefined) room.notes = notes;

    // Handle photo upload
    if (photoFile) {
      room.photo = `/uploads/${photoFile.filename}`;
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
import { Map } from "../models/map.model.js";

// ====== Create a New Map ======
export const createMap = async (req, res) => {
  try {
    const { title, numberOfFloors, roomsPerFloor } = req.body;
    const userId = req.user._id; // from auth middleware

    // Generate floors and empty rooms
    const floors = Array.from({ length: numberOfFloors }, (_, i) => ({
      floorNumber: i + 1,
      rooms: Array.from({ length: roomsPerFloor }, () => ({
        name: "Untitled Room",
        photo: "",
        notes: "",
        qrCode: uuidv4(),
      })),
    }));

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
    const { mapId, floorNumber, roomIndex } = req.params;
    const { name, notes } = req.body;

    const map = await Map.findById(mapId);
    if (!map) return res.status(404).json({ success: false, message: "Map not found" });

    //creator can edit
    if (map.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const floor = map.floors.find(f => f.floorNumber == floorNumber);
    if (!floor) return res.status(404).json({ success: false, message: "Floor not found" });

    if (!floor.rooms[roomIndex]) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Update room
    floor.rooms[roomIndex].name = name || floor.rooms[roomIndex].name;
    //floor.rooms[roomIndex].photo = photo || floor.rooms[roomIndex].photo;
    floor.rooms[roomIndex].notes = notes || floor.rooms[roomIndex].notes;

    // Handle photo upload (from multer)
    if (req.file) {
      floor.rooms[roomIndex].photo = `/uploads/${req.file.filename}`;
    }

    await map.save();

    res.json({ 
      success: true, 
      message: "Room updated successfully", 
      data: floor.rooms[roomIndex] });
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

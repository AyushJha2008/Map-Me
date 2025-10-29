// backend/src/models/map.model.js (replace the full content of this file)
import mongoose, { Schema } from "mongoose";

// ====== Room Schema ======
const roomSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String },
    notes: { type: String },
    qrCode: { type: String },
  },
  { timestamps: true }
);

// ====== Section Schema ======
const sectionSchema = new Schema({
  sectionNumber: { type: Number, required: true },
  rooms: [roomSchema],
});

// ====== Feature Point Schema (NEW) ======
const featurePointSchema = new Schema({
    type: {
        type: String,
        required: true,
        // Enforce specific types for routing logic
        enum: ['Stairs', 'Lift', 'Entrance', 'Exit', 'Restroom'] 
    },
    label: { type: String, required: true }, // e.g., "Main Stairwell"
    // For routing, we minimally need a label and a type. Coordinates (x, y) can be added later.
}, { _id: true, timestamps: false });


// ====== Floor Schema ======
const floorSchema = new Schema({
    floorNumber: { type: Number, required: true },
    sections: [sectionSchema], 
    featurePoints: [featurePointSchema], // NEW: Array to hold stairs, lifts, etc.
});

// ====== Map Schema ======
const mapSchema = new Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    floors: [floorSchema], 
  },
  { timestamps: true }
);

export const Map = mongoose.model("Map", mapSchema);
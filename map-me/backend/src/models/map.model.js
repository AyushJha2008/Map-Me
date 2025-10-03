import mongoose, { Schema } from "mongoose";

// ====== Room Schema ======
const roomSchema = new Schema(
  {
    name: { type: String, required: true },   // "Lab 101"
    photo: { type: String },                  // image URL
    notes: { type: String },                  // notes or events
    qrCode: { type: String },                 // QR link/image
  },
  { timestamps: true }
);

// ====== Section Schema ======
const sectionSchema = new Schema({
  sectionNumber: { type: Number, required: true }, // e.g. 1, 2, 3
  rooms: [roomSchema],
});

// ====== Floor Schema ======
const floorSchema = new Schema({
  floorNumber: { type: Number, required: true }, // e.g. 1, 2, 3
  sections: [sectionSchema],                     // sections inside floor
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

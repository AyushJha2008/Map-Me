import mongoose, { Schema } from "mongoose";

// ====== Room Schema ======
const roomSchema = new Schema(
  {
    name: { type: String, required: true },   // e.g. "Lab 101"
    photo: { type: String },                  // image URL (Cloudinary/local)
    notes: { type: String },                  // e.g. "Today’s offer" / "Restricted area"
    qrCode: { type: String },                 // link or generated QR image
  },
  { timestamps: true }
);

// ====== Floor Schema ======
const floorSchema = new Schema({
  floorNumber: { type: Number, required: true }, // e.g. 1, 2, 3
  rooms: [roomSchema],                           // array of rooms
});

// ====== Map Schema ======
const mapSchema = new Schema(
  {
    title: { type: String, required: true },       // e.g. "Shopping Mall Map"
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Organizer
    floors: [floorSchema],                         // floors + rooms
  },
  { timestamps: true }
);

export const Map = mongoose.model("Map", mapSchema);

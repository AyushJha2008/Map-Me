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

// ====== Floor Schema ======
const floorSchema = new Schema({
  floorNumber: { type: Number, required: true },
  sections: [sectionSchema], // Now floors contain sections
});

// ====== Map Schema ======
const mapSchema = new Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    floors: [floorSchema], // floors + sections + rooms
  },
  { timestamps: true }
);

export const Map = mongoose.model("Map", mapSchema);
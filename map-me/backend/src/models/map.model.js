import mongoose, { Schema } from "mongoose";

// ====== Room Schema ======
const roomSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String },
    notes: { type: String },
    qrCode: { type: String },
    classification: {
        type: String,
        enum: ['Normal', 'Stairs', 'Lift', 'Entrance', 'Exit', 'Restroom'],
        default: 'Normal'
    }
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
    sections: [sectionSchema], 
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
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { app } from "./app.js";
import { DB_NAME } from "./constants.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 8000;
const MONGO_URI = `${process.env.MONGODB_URL}/${DB_NAME}`;

// Self-invoking async function
(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Database connected successfully");

    app.on("error", (error) => {
      console.error("❌ Express app error:", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Exit if DB connection fails
  }
})();

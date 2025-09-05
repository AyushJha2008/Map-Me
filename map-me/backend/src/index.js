import dotenv from "dotenv";
// dotenv.config()
import path from "path";
import { fileURLToPath } from "url";
// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import { app } from "./app.js"

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("db connected ");
        app.on("error", (error)=>{
            console.log("not able to talk with database", error);
            throw error
        })
        app.listen(process.env.PORT || 8000, ()=>{
            console.log("post is listening on", process.env.PORT);
        });
    }
    catch(error){
        console.log("error:", error);
    }
})();
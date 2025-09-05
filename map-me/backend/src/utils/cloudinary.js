import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// File uploader
const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto', //png, pdf, jpeg, svg
        });
        // this unlink is becoz we dont want to full our free cloudinary storage
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error?.message || error);
        fs.unlinkSync(localFilePath); 
        return null;
    }
};

export { uploadCloudinary };

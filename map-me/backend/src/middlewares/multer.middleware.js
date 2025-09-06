import multer from "multer"
import fs from "fs";
import path from "path";

// Ensure upload folder exists
const uploadPath = path.resolve("./public/temp");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {   //cb:callback
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop(); // get file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
})

// File filter (accept only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, .webp files are allowed!"), false);
  }
};


export const upload = multer({ storage, fileFilter,
   limits: { fileSize: 5 * 1024 * 1024 }, })
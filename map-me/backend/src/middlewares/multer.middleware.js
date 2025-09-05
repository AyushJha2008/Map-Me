import multer from "multer"

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

export const upload = multer({ storage })
import multer from "multer";

const strorageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

export const multerUpload = multer({ storage: strorageConfig });

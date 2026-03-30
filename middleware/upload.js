import multer from "multer";
import path from "path";

// 1. Define Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure you create this folder in your root!
  },
  filename: (req, file, cb) => {
    // Save as: timestamp-originalname.jpg
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 2. Filter for Images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .png, and .jpg formats are allowed!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit to 5MB
});

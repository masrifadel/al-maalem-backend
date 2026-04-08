import multer from "multer";
import path from "path";
import fs from "fs";

// Save to backend ROOT uploads folder - permanent storage
const uploadsPath = path.resolve(process.cwd(), "uploads");

console.log("=== ROOT UPLOAD SETUP ===");
console.log("Backend root:", process.cwd());
console.log("Uploads path:", uploadsPath);

// Create uploads directory at startup if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  console.log("Creating uploads directory:", uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Uploads directory created successfully");
} else {
  console.log("Uploads directory exists");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving to:", uploadsPath);
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .png, .jpg, and .webp formats are allowed!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use the most reliable path resolution
    const uploadsPath = path.join(process.cwd(), "uploads");

    console.log("=== UPLOAD DEBUGGING ===");
    console.log("process.cwd():", process.cwd());
    console.log("__dirname:", __dirname);
    console.log("uploadsPath:", uploadsPath);
    console.log("uploadsPath resolved:", path.resolve(uploadsPath));

    // Create uploads directory if it doesn't exist
    const fs = require("fs");
    if (!fs.existsSync(uploadsPath)) {
      console.log("Creating uploads directory:", uploadsPath);
      try {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log("✅ Uploads directory created successfully");
      } catch (error) {
        console.error("❌ Failed to create uploads directory:", error);
      }
    } else {
      console.log("✅ Uploads directory already exists");
    }

    // Verify directory exists and is writable
    try {
      const stats = fs.statSync(uploadsPath);
      console.log("Directory stats:", stats);
      console.log("Is directory:", stats.isDirectory());
      console.log("Writable:", (stats.mode & parseInt("777", 8)) !== 0);
    } catch (error) {
      console.error("❌ Error checking directory:", error);
    }

    console.log("Final upload destination:", uploadsPath);
    console.log("=== END UPLOAD DEBUGGING ===");

    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("File upload started:", file.originalname);
    cb(null, true);
  },
});

// Add file verification middleware
export const verifyUpload = (req, res, next) => {
  if (req.file) {
    const filePath = path.join(process.cwd(), "uploads", req.file.filename);
    console.log("=== FILE VERIFICATION ===");
    console.log("Expected file path:", filePath);
    console.log("File filename:", req.file.filename);
    console.log("File originalname:", req.file.originalname);
    console.log("File size:", req.file.size, "bytes");
    console.log("File mimetype:", req.file.mimetype);

    // Check if file actually exists
    const fs = require("fs");
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log("✅ File saved successfully:", req.file.filename);
      console.log("File size on disk:", stats.size, "bytes");
      console.log("File created:", stats.birthtime);
      console.log("File modified:", stats.mtime);

      // List all files in uploads directory
      try {
        const files = fs.readdirSync(path.join(process.cwd(), "uploads"));
        console.log("Files in uploads directory:", files);
      } catch (error) {
        console.error("Error listing uploads directory:", error);
      }

      next();
    } else {
      console.error("❌ File not found after upload:", filePath);
      console.error(
        "Uploads directory contents:",
        fs.readdirSync(path.join(process.cwd(), "uploads")),
      );
      res.status(500).json({ error: "File upload failed - file not saved" });
    }
    console.log("=== END FILE VERIFICATION ===");
  } else {
    console.log("No file in request");
    next();
  }
};

export { upload };

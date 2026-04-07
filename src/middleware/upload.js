import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use multiple path resolution methods for robustness
    const path1 = path.resolve(process.cwd(), "uploads");
    const path2 = path.join(__dirname, "..", "..", "uploads");
    const path3 = path.join(process.cwd(), "uploads");

    console.log("Upload destination paths:");
    console.log("  path1 (resolve):", path1);
    console.log("  path2 (join):", path2);
    console.log("  path3 (cwd+join):", path3);
    console.log("  process.cwd():", process.cwd());
    console.log("  __dirname:", __dirname);

    // Use the first valid path
    const uploadsPath = path1;
    console.log("Final upload destination:", uploadsPath);
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
    const filePath = path.resolve(process.cwd(), "uploads", req.file.filename);
    console.log("Verifying file exists at:", filePath);

    // Check if file actually exists
    const fs = require("fs");
    if (fs.existsSync(filePath)) {
      console.log("File saved successfully:", req.file.filename);
      console.log("File size:", req.file.size, "bytes");
      next();
    } else {
      console.error("File not found after upload:", filePath);
      res.status(500).json({ error: "File upload failed - file not saved" });
    }
  } else {
    next();
  }
};

export { upload };

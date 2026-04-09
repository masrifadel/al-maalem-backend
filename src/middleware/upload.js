import multer from "multer";
import path from "path";
import fs from "fs";

// Save to backend ROOT uploads folder - permanent storage (go up from src to project root)
const uploadsPath = path.resolve(process.cwd(), "..", "uploads");

console.log("=== ROOT UPLOAD SETUP ===");
console.log("Backend root:", process.cwd());
console.log("Uploads path:", uploadsPath);

// Create uploads directory at startup if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  console.log("Creating uploads directory:", uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true, mode: 0o777 });
  console.log("Uploads directory created successfully");
} else {
  console.log("Uploads directory exists");

  // Try multiple permission approaches
  try {
    fs.chmodSync(uploadsPath, 0o777);
    console.log("Uploads directory permissions updated to 777");
  } catch (error) {
    console.error("Failed to update permissions to 777:", error);

    // Try alternative approach
    try {
      fs.chmodSync(uploadsPath, 0o755);
      console.log("Uploads directory permissions updated to 755");
    } catch (error2) {
      console.error("Failed to update permissions to 755:", error2);
    }
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("=== UPLOAD DESTINATION ===");
    console.log("Saving to:", uploadsPath);
    console.log("Directory exists:", fs.existsSync(uploadsPath));
    console.log(
      "Directory writable:",
      fs.existsSync(uploadsPath)
        ? fs.accessSync(uploadsPath, fs.constants.W_OK)
          ? "YES"
          : "NO"
        : "N/A",
    );
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Unique filename to prevent conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only .jpeg, .png, .jpg, and .webp formats are allowed!"),
      false,
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  onFileUploadStart: (file) => {
    console.log("=== FILE UPLOAD START ===");
    console.log("Original name:", file.originalname);
    console.log("Mimetype:", file.mimetype);
    console.log("Size:", file.size);
  },
  onFileUploadComplete: (file) => {
    console.log("=== FILE UPLOAD COMPLETE ===");
    console.log("Saved as:", file.filename);
    console.log("Path:", file.path);

    // Verify file was actually saved
    const fullPath = path.join(uploadsPath, file.filename);
    console.log("Expected path:", fullPath);
    console.log("File exists:", fs.existsSync(fullPath));

    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log("File size:", stats.size);
      console.log("File created:", stats.birthtime);
      console.log("File modified:", stats.mtime);
      console.log("=== FILE SAVED SUCCESSFULLY ===");
    } else {
      console.error("=== FILE NOT FOUND AFTER UPLOAD ===");
    }
  },
});

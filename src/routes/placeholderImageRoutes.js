import express from "express";

const router = express.Router();

// Serve placeholder images for missing files
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  
  // Extract name without extension for display
  const displayName = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '').replace(/-/g, ' ');
  
  // Create SVG placeholder
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect width="100%" height="100%" fill="none" stroke="#dee2e6" stroke-width="2"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="14" fill="#6c757d" text-anchor="middle">
        ${displayName.toUpperCase()}
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="#adb5bd" text-anchor="middle">
        Image Placeholder
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  res.send(svg);
});

export default router;

import express from "express";
import path from "path";

const router = express.Router();

// Serve placeholder images
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  
  // List of expected placeholder images
  const placeholderImages = [
    'grilled-sandwiches.jpg',
    'burgers.jpg', 
    'plates.jpg',
    'drinks.jpg',
    'chicken-sandwich.jpg',
    'beef-burger.jpg',
    'mixed-grill.jpg'
  ];
  
  if (placeholderImages.includes(filename)) {
    // Serve a simple SVG placeholder
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">
          ${filename.replace('.jpg', '').replace('-', ' ').toUpperCase()}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } else {
    res.status(404).json({ message: 'Image not found' });
  }
});

export default router;

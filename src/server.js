import express from "express";
import productsRoutes from "./routes/productsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import placeholderImageRoutes from "./routes/placeholderImageRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import mongodbConn from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5001;

// Add trust proxy for proper IP detection
app.set("trust proxy", 1);

// 1. CORS FIRST - before rate limiter
app.use(
  cors({
    origin: [
      "https://e-commerce-almaalem-frontend-o2i9.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
      "Accept",
    ],
    optionsSuccessStatus: 204,
    preflightContinue: true,
  }),
);

// Remove additional CORS middleware to avoid conflicts

// 2. Body Parsing SECOND
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 3. Rate Limiter LAST - scoped to /api only
app.use("/api", rateLimiter);

mongodbConn();

// Seed database with sample data
setTimeout(async () => {
  try {
    const Category = (await import("./models/Category.js")).default;
    const Product = (await import("./models/Product.js")).default;

    // Check if categories exist
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      // Create sample categories
      const categories = [
        {
          name: "Grilled Sandwiches",
          path: "grilled-sandwiches",
          imageUrl: "/uploads/grilled-sandwiches.jpg",
        },
        { name: "Burgers", path: "burgers", imageUrl: "/uploads/burgers.jpg" },
        { name: "Plates", path: "plates", imageUrl: "/uploads/plates.jpg" },
        { name: "Drinks", path: "drinks", imageUrl: "/uploads/drinks.jpg" },
      ];

      await Category.insertMany(categories);
      console.log("✅ Sample categories created");
    }

    // Check if products exist
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      // Get categories
      const grilledCategory = await Category.findOne({
        path: "grilled-sandwiches",
      });
      const burgersCategory = await Category.findOne({ path: "burgers" });
      const platesCategory = await Category.findOne({ path: "plates" });

      // Create sample products
      const products = [
        {
          name: "Grilled Chicken Sandwich",
          description: "Charcoal-grilled chicken breast with special sauce",
          price: 12000,
          categoryId: grilledCategory?._id,
          available: true,
          isFeatured: true,
          url: "/uploads/chicken-sandwich.jpg",
        },
        {
          name: "Classic Beef Burger",
          description:
            "Juicy beef patty with lettuce, tomato, and our special sauce",
          price: 15000,
          categoryId: burgersCategory?._id,
          available: true,
          isFeatured: true,
          url: "/uploads/beef-burger.jpg",
        },
        {
          name: "Mixed Grill Plate",
          description: "Assorted grilled meats with rice and salad",
          price: 25000,
          categoryId: platesCategory?._id,
          available: true,
          isFeatured: false,
          url: "/uploads/mixed-grill.jpg",
        },
      ];

      await Product.insertMany(products);
      console.log("✅ Sample products created");
    }

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}, 2000);

// Static files - Serve from backend ROOT uploads folder (go up from src to project root)
const uploadsPath = path.resolve(process.cwd(), "..", "uploads");

console.log("=== SERVER STATIC SETUP ===");
console.log("Backend root:", process.cwd());
console.log("Serving uploads from:", uploadsPath);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  console.log("Creating uploads directory:", uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true, mode: 0o755 });
  console.log("Uploads directory created successfully");
} else {
  console.log("Uploads directory exists");

  // Ensure directory has proper permissions
  try {
    fs.chmodSync(uploadsPath, 0o755);
    console.log("Uploads directory permissions updated");
  } catch (error) {
    console.error("Failed to update permissions:", error);
  }
}

app.use("/uploads", express.static(uploadsPath));

// Request logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _, next) => {
    console.log(
      "Request method is " + req.method + " and URL method is: ",
      req.url,
    );
    next();
  });
}

// API routes
app.use("/api/checkout", ordersRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/category", categoryRoutes);

// Fallback placeholder images for missing uploads
app.use(placeholderImageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Deployment trigger
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

export default server;

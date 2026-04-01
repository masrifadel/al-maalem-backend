import express from "express";
import productsRoutes from "./routes/productsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import placeholderImageRoutes from "./routes/placeholderImageRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

import mongodbConn from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(rateLimiter);

// CORS configuration - comprehensive fix
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(
  cors({
    origin: [
      "https://e-commerce-almaalem-frontend-o2i9.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://maalem-backend-ybme.onrender.com",
      "*",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Origin",
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  }),
);

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

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files - Use the uploads folder in the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the uploads folder in the root directory (backend/uploads)
const uploadsPath = path.join(__dirname, "..", "uploads");

console.log("Using uploads path:", uploadsPath);
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
app.use("/api/cart", cartRoutes);

// Static files - Use the uploads folder in the root directory
// Use the uploads folder in the root directory (backend/uploads)
console.log("Using uploads path:", uploadsPath);
app.use("/uploads", express.static(uploadsPath));

// Fallback placeholder images for missing uploads
app.use("/uploads", placeholderImageRoutes);

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

import express from "express";
import productsRoutes from "./routes/productsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
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

// CORS configuration - handle preflight requests properly
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

// Handle preflight requests explicitly for each route
app.options("/api/user/signup", cors());
app.options("/api/user/signin", cors());
app.options("/api/category", cors());
app.options("/api/products", cors());
app.options("/api/cart", cors());
app.options("/api/checkout", cors());

mongodbConn();

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files - Multiple path attempts for uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try different possible paths for uploads folder
const uploadsPath1 = path.join(__dirname, "..", "uploads");
const uploadsPath2 = path.join(__dirname, "..", "..", "uploads");
const uploadsPath3 = path.join(__dirname, "uploads");

// Use the first path that exists
const fs = await import("fs");
let uploadsPath = uploadsPath3; // default
try {
  if (fs.existsSync(uploadsPath1)) {
    uploadsPath = uploadsPath1;
  } else if (fs.existsSync(uploadsPath2)) {
    uploadsPath = uploadsPath2;
  }
} catch (error) {
  console.log("Could not check uploads paths:", error);
}

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

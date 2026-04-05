import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken } from "../../middleware/auth.js";

const router = express.Router();

// Public routes - no authentication needed
router.post("/", createOrder);
router.get("/:id", getOrderById); // Public endpoint for receipt page

// Admin routes - authentication required
router.get("/admin/all", verifyToken, getAllOrders);
router.put("/admin/:id/status", verifyToken, updateOrderStatus);

export default router;

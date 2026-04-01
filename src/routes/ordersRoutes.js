import express from "express";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken } from "../../middleware/auth.js";

const router = express.Router();

// Public routes - no authentication needed
router.post("/", createOrder);

// Admin routes - authentication required
router.get("/admin/all", verifyToken, getAllOrders);
router.put("/admin/:id/status", verifyToken, updateOrderStatus);

export default router;

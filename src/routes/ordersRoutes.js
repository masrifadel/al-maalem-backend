import express from "express";
import {
  createOrder,
  getOrderDetails,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken } from "../../middleware/auth.js";
import { isAdmin } from "../../middleware/adminAuth.js";
const router = express.Router();

// User routes
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderDetails);

// Admin routes
router.get("/admin/all", verifyToken, isAdmin, getAllOrders);
router.put("/admin/:id/status", verifyToken, isAdmin, updateOrderStatus);

export default router;

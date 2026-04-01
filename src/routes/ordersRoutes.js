import express from "express";
import { verifyToken } from "../../middleware/auth.js";
import {
  createOrder,
  getOrderDetails,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// User routes
router.post("/", createOrder); // Remove verifyToken middleware
router.get("/", verifyToken, getUserOrders);
router.get("/:id", verifyToken, getOrderDetails);

// Admin routes
router.get("/admin/all", verifyToken, getAllOrders);
router.put("/admin/:id/status", verifyToken, updateOrderStatus);

export default router;

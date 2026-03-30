import express from "express";
import {
  createOrder,
  getOrderDetails,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

// User routes
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:id", getOrderDetails);

// Admin routes
router.get("/admin/all", getAllOrders);
router.put("/admin/:id/status", updateOrderStatus);

export default router;

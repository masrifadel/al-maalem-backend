import express from "express";
import {
  mergeToCart,
  UpdateQuantity,
  addOneProductToCart,
  getCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../../middleware/auth.js";
const router = express.Router();

router.post("/addProduct", verifyToken, addOneProductToCart);
router.post("/", verifyToken, mergeToCart);
router.put("/", verifyToken, UpdateQuantity);
router.get("/", verifyToken, getCart);

export default router;

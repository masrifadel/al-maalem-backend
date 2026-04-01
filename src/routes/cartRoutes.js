import express from "express";
import {
  mergeToCart,
  UpdateQuantity,
  addOneProductToCart,
  getCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../../middleware/auth.js";
const router = express.Router();

// Cart routes - remove authentication for guest access
router.post("/merge", mergeToCart);
router.post("/addOneProduct", addOneProductToCart);
router.put("/UpdateQuantity", UpdateQuantity);
router.get("/", getCart);

export default router;

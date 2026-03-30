import express from "express";
import { isAdmin } from "../../middleware/adminAuth.js";
import { verifyToken } from "../../middleware/auth.js";
import { upload } from "../../middleware/upload.js";

import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOneProduct,
  getFeaturedProducts,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.post("/", verifyToken, isAdmin, upload.single("image"), addProduct);
router.get("/:id", getOneProduct);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;

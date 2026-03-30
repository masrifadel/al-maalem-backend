import express from "express";
import { isAdmin } from "../../middleware/adminAuth.js";
import { verifyToken } from "../../middleware/auth.js";
import { upload } from "../../middleware/upload.js";

import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyToken, isAdmin, upload.single("image"), createCategory);
router.get("/:id", getCategory);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  updateCategory,
);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;

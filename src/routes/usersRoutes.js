import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  getUserAddresses,
} from "../controllers/userController.js";
import { verifyToken } from "../../middleware/auth.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/addresses", verifyToken, getUserAddresses);

export default router;

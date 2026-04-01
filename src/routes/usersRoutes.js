import express from "express";
import { signin, verifyToken } from "../controllers/userController.js";

const router = express.Router();

// Admin login route
router.post("/signin", signin);

export default router;

import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  getUserAddresses,
} from "../controllers/userController.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/addresses", getUserAddresses);

export default router;

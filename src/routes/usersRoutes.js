import express from "express";
const router = express.Router();

import {
  signup,
  signin,
  getUserAddresses,
  createAdmin,
  getHashedPassword,
} from "../controllers/userController.js";

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/create-admin", createAdmin);
router.get("/get-hashed-password", getHashedPassword);
router.get("/addresses", getUserAddresses);

export default router;

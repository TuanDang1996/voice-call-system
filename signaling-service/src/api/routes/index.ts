import express from "express";
import recording from "./recording";
const router = express.Router();
router.use("/recording", recording);
export default router;

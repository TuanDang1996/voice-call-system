import express from "express";
import recording from "./recording";
const router = express.Router();
router.use("/recordings", recording);
export default router;

import express from "express";
import recording from "./recording";
import voiceMail from "./voicemail";
const router = express.Router();
router.use("/recordings", recording);
router.use("/voicemails", voiceMail);

export default router;

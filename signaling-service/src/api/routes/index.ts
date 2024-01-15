import express from "express";
import recording from "@/api/routes/recording";
import voiceMail from "@/api/routes/voicemail";
const router = express.Router();
router.use("/recordings", recording);
router.use("/voicemails", voiceMail);

export default router;

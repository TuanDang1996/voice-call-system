import express from "express";
import { VoiceMailController } from "src/api/controllers/VoiceMail";
const router = express.Router();
const controllers = new VoiceMailController();
router.post("/:recordingToken", controllers.recordVoiceMail);
router.get("/", controllers.getVoiceMails);

export default router;

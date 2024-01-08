import express from "express";
import { RecordingController } from "src/api/controllers/Recording";

const router = express.Router();
const controllers = new RecordingController();
router.post("/:recordingToken", controllers.recordMedia);
router.get("/", controllers.getListRecording);
router.get("/download/:filename", controllers.downloadMedia);

export default router;

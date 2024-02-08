import express from "express";
import { RecordingController } from "@/api/controllers/Recording";

const router = express.Router();
const controllers = new RecordingController();
router.post("/:recordingToken", controllers.recordMedia);
router.get("/", controllers.getListRecording);
router.get("/download/:filename", controllers.downloadMedia);
router.get("/stream/:filename", controllers.streamRecording);

export default router;

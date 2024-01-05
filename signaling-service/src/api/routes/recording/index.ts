import express from "express";
import controllers from "src/api/controllers";

const router = express.Router();

router.post("/:recordingToken", controllers.recording.recordMedia);
router.get("/", controllers.recording.getListRecording);

export default router;

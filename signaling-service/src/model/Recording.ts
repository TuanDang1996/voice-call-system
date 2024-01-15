import mongoose, { Document, Schema } from "mongoose";
import { TRecording } from "@/types/Recording";

interface RecordingDocument extends TRecording, Document {}

const recordingSchema = new Schema<RecordingDocument>({
  owner: String,
  key: String,
  url: String,
  created_date: { type: Date, default: Date.now },
});

const Recording = mongoose.model<RecordingDocument>(
  "Recording",
  recordingSchema
);

export default Recording;

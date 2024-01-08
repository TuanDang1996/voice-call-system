import mongoose, { Document, Schema } from "mongoose";
import { TVoiceMail } from "src/types/VoiceMail";

interface VoiceMailDocument extends TVoiceMail, Document {}

const voiceMailSchema = new Schema<VoiceMailDocument>({
  sender: String,
  recipient: String,
  fileName: String,
  fileUrl: String,
  seen_at: Date,
  created_date: { type: Date, default: Date.now },
});

const Recording = mongoose.model<VoiceMailDocument>(
  "VoiceMail",
  voiceMailSchema
);

export default Recording;

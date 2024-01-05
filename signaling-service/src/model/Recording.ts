import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema({
  owner: String,
  key: String,
  url: String,
  created_date: { type: Date, default: Date.now },
});

const Recording = mongoose.model("Recording", recordingSchema);

export default Recording;

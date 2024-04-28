import mongoose from "mongoose";
import config from "@/config";

mongoose.connect(config.MONGODB_URL, { dbName: "SignalingService" , user: "root", pass: "password"});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

export default db;

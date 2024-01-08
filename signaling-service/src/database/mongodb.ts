import mongoose from "mongoose";
import * as config from "@appConfig";

mongoose.connect(config.MONGODB_URL, { dbName: "SignalingService" });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

export default db;

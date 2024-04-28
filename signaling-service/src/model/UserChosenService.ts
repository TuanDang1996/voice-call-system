import mongoose, { Document, Schema } from "mongoose";
import { TUserChosenServices } from "@/types/UserChosenService";

interface UserChosenServiceDocument extends TUserChosenServices, Document {}

const userChosenServiceSchema = new Schema<UserChosenServiceDocument>({
  "user_name": String,
  "services": {type: Array, default: []},
  "created_date": { type: Date, default: Date.now },
});

const UserChosenService = mongoose.model<UserChosenServiceDocument>(
  "UserChosenService",
    userChosenServiceSchema
);

export default UserChosenService;

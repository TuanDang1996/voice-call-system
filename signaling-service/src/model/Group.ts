import mongoose, { Document, Schema } from "mongoose";
import { TGroup } from "@/types/Group";

interface GroupDocument extends TGroup, Document {}

const groupSchema = new Schema<GroupDocument>({
  "name": String,
  "is_active": Boolean,
  "created_date": { type: Date, default: Date.now },
});

const Group = mongoose.model<GroupDocument>(
  "group",
    groupSchema
);

export default Group;

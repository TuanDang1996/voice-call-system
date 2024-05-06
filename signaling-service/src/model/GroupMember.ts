import mongoose, { Document, Schema } from "mongoose";
import { TGroupMember } from "@/types/GroupMember";

interface GroupMemberDocument extends TGroupMember, Document {}

const groupMemberSchema = new Schema<GroupMemberDocument>({
  "group_id": String,
  "member_name": String,
  "created_date": { type: Date, default: Date.now },
});

const GroupMember = mongoose.model<GroupMemberDocument>(
  "groupMember",
    groupMemberSchema
);

export default GroupMember;

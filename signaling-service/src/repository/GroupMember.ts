import GroupMember from "@/model/GroupMember";
import { TGroupMember } from "@/types/GroupMember";
import {TPaginationResponse} from "@/types/Pagination";

export class GroupMemberRepository {
  async create(data: TGroupMember) {
    const recording = new GroupMember(data);
    return await recording.save();
  }

  async findAllGroups(member_name: string) {
    return await GroupMember.find({member_name: member_name});
  }

  async findAllMemberInGroup(group_id: string) {
    return await GroupMember.find({group_id: group_id});
  }

  async leaveGroup(member_name: string, group_id: string) {
    return await GroupMember.findOneAndDelete({member_name: member_name, group_id: group_id});
  }
}

export default {
  GroupMemberRepository
};

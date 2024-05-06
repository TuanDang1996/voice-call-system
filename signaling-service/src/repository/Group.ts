import Group from "@/model/Group";
import { TPaginationResponse } from "@/types/Pagination";
import { TGroup } from "@/types/Group";

export class GroupRepository {
  async create(data: TGroup) {
    const elm = new Group(data);
    return await elm.save();
  }

  async getById(id: string) {
    return await Group.findById(id);
  }

  async deleteRecording(id: string) {
    return await Group.findByIdAndDelete(id);
  }
}

export default {
  GroupRepository,
};

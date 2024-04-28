import UserChosenService from "@/model/UserChosenService";
import { TUserChosenServices } from "@/types/UserChosenService";

export class UserChosenServiceRepository {
  async create(data: TUserChosenServices) {
    const recording = new UserChosenService(data);
    return await recording.save();
  }

  async getUserByServiceId(id: string) {
    return await UserChosenService.find({services: { "$in" : [id]} });
  }

  async update(id: string, data: TUserChosenServices) {
    return await UserChosenService.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await UserChosenService.findByIdAndDelete(id);
  }
}

export default {
  UserChosenServiceRepository
};

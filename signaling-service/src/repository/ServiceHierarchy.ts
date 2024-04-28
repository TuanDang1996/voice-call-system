import ServiceHierarchy from "@/model/ServiceHierarchy";
import { TServiceHierarchy } from "@/types/ServiceHirarchy";
import {TPaginationResponse} from "@/types/Pagination";

export class ServiceHierarchyRepository {
  async create(data: TServiceHierarchy) {
    const recording = new ServiceHierarchy(data);
    return await recording.save();
  }

  async getServiceHierarchyId(id: string) {
    return await ServiceHierarchy.findById(id);
  }

  async findNextAction(preAction: any, chosenAction: any){
    return await ServiceHierarchy.findOne({ parent_id: preAction, text_to_choose: chosenAction});
  }

  async findChildActions(chosenAction: any){
    return await ServiceHierarchy.find({ parent_id: chosenAction});
  }

  async findProcessActions(){
    return await ServiceHierarchy.findOne({ type: 'process_call'});
  }

  async findBusyActions(){
    return await ServiceHierarchy.findOne({ type: 'busy_call'});
  }

  async findRootAction(){
    return await ServiceHierarchy.findOne({ type: 'root'});
  }

  async update(id: string, data: TServiceHierarchy) {
    return await ServiceHierarchy.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return await ServiceHierarchy.findByIdAndDelete(id);
  }

  async getAllService(
      page = 1,
      limit = 10
  ): Promise<TPaginationResponse> {
    const skip = (page - 1) * limit;
    const recordings = await ServiceHierarchy.find()
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });
    const total = await ServiceHierarchy.countDocuments();
    return {
      total: total,
      page: page,
      limit: limit,
      data: recordings,
    };
  }
}

export default {
  ServiceHierarchyRepository
};

import Recording from "src/model/Recording";
import { TPaginationResponse } from "src/types/Pagination";
import { TRecording } from "src/types/Recording";

export class RecordingRepository {
  async createRecording(data: TRecording) {
    const recording = new Recording(data);
    return await recording.save();
  }

  async getRecordingById(id: string) {
    return await Recording.findById(id);
  }

  async getRecordingsByOwner(
    owner: TRecording["owner"],
    page = 1,
    limit = 10
  ): Promise<TPaginationResponse> {
    const skip = (page - 1) * limit;
    const recordings = await Recording.find({ owner: owner })
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });
    const total = await Recording.countDocuments({ owner: owner });
    return {
      total: total,
      page: page,
      limit: limit,
      data: recordings,
    };
  }

  async updateRecording(id: string, data: TRecording) {
    return await Recording.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteRecording(id: string) {
    return await Recording.findByIdAndDelete(id);
  }
}

export default {
  RecordingRepository,
};

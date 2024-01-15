import VoiceMail from "@/model/VoiceMail";
import { TPaginationResponse } from "@/types/Pagination";
import { TVoiceMail } from "@/types/VoiceMail";

export class VoiceMailRepository {
  async createVoiceMail(data: TVoiceMail) {
    const voiceMail = new VoiceMail(data);
    return await voiceMail.save();
  }

  async getVoiceMailById(id: string) {
    return await VoiceMail.findById(id);
  }

  async getVoiceMails(
    page: number = 1,
    limit: number = 10,
    recipient: string = null,
    sender: string = null
  ): Promise<TPaginationResponse> {
    const skip = (page - 1) * limit;
    let query = {};
    if (sender) query["sender"] = sender;
    if (recipient) query["recipient"] = recipient;

    const voiceMails = await VoiceMail.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });
    const total = await VoiceMail.countDocuments();
    return {
      total: total,
      page: page,
      limit: limit,
      data: voiceMails,
    };
  }

  async updateVoiceMail(id: string, data: TVoiceMail) {
    return await VoiceMail.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteVoiceMail(id: string) {
    return await VoiceMail.findByIdAndDelete(id);
  }
}

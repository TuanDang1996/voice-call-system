import { TPaginationResponse } from "@/types/Pagination";
import { VoiceMailRepository } from "@/repository/VoiceMail";
import { TVoiceMail, TVoiceMailPayloadToken } from "@/types/VoiceMail";
import jwt from "jsonwebtoken";
import config from "@/config";
import { v4 } from "uuid";
import path from "path";
import { MediaStoringService } from "@/services/MediaStoring";
import { Request, Response } from "express";
import {
  InternalErrorResponse,
  SuccessResponse,
} from "@/api/utils/ApiResponse";

enum VoiceMailTypeEnum {
  INCOMING = "INCOMING",
  OUTGOING = "OUTGOING",
}

export class VoiceMailService {
  public repo: VoiceMailRepository;

  constructor() {
    this.repo = new VoiceMailRepository();
  }

  private _generateVoiceMailName = (sender: string, recipient: string) => {
    const dat = new Date().toISOString().replace(/[:.]/g, "-");
    return `voicemail_${sender}_${recipient}_${v4()}_${dat}.webm`;
  };

  public getVoiceMails = async (
    userId: string,
    page: number,
    limit: number,
    type: VoiceMailTypeEnum | string
  ): Promise<TPaginationResponse> => {
    if (type === VoiceMailTypeEnum.INCOMING) {
      return await this.repo.getVoiceMails(page, limit, userId, null);
    } else {
      return await this.repo.getVoiceMails(page, limit, null, userId);
    }
  };

  public static generateVoiceMailRecorderURI = (
    sender: TVoiceMail["sender"],
    recipient: TVoiceMail["recipient"]
  ) => {
    const data: TVoiceMailPayloadToken = {
      sender: sender,
      recipient: recipient,
    };
    const options = {
      expiresIn: "1h",
    };
    const recordingToken = jwt.sign(data, config.SECRET_KEY, options);
    return `${config.APP_ENDPOINT}${config.API_PREFIX}/voicemails/${recordingToken}`;
  };

  public decodeRecordingVoiceMailToken = (recordingToken: string) => {
    try {
      const data = jwt.verify(recordingToken, config.SECRET_KEY);
      return data as TVoiceMailPayloadToken;
    } catch (err) {
      console.error("Error decoding recording token: ", err);
      return null;
    }
  };

  public uploadVoiceMailToLocal = (
    req: Request,
    res: Response,
    sender: string,
    recipient: string
  ) => {
    const self = this;
    const fileName = self._generateVoiceMailName(sender, recipient);
    const filePath = path.join(config.MEDIA_PATH, fileName);
    MediaStoringService.storeLocalMedia(
      req,
      filePath,
      () => {
        self.repo.createVoiceMail({
          sender: sender,
          recipient: recipient,
          fileName: fileName,
          fileUrl: MediaStoringService.generateDownloadableURI(fileName),
        });
        return new SuccessResponse("Upload finished", null).send(res);
      },
      () => {
        return new InternalErrorResponse("Upload failed").send(res);
      }
    );
  };

  public uploadRecordingToAWS = (
    req: Request,
    sender: string,
    recipient: string
  ) => {
    let self = this;
    const fileName = self._generateVoiceMailName(sender, recipient);
    MediaStoringService.uploadMediaToAWS(
      req,
      fileName,
      (data) => {
        console.log("Upload Success: ", data);
        self.repo.createVoiceMail({
          sender: sender,
          recipient: recipient,
          fileName: fileName,
          fileUrl: MediaStoringService.generateDownloadableURI(fileName),
        });
      },
      (err) => {
        console.log("Error while uploading media to s3", err);
      }
    );
  };
}

export default {
  VoiceMailService,
};

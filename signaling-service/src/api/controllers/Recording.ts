import * as config from "@appConfig";
import AsyncHandler from "../utils/AsyncHandler";
import { ForbiddenResponse, SuccessResponse } from "../utils/ApiResponse";
import { RecordingService } from "../services/Recording";

export class RecordingController {
  private service: RecordingService;
  constructor() {
    this.service = new RecordingService();
  }

  public recordMedia = AsyncHandler(async (req, res) => {
    const tokenData = this.service.decodeRecordingToken(
      req.params.recordingToken
    );

    if (!tokenData) {
      return new ForbiddenResponse().send(res);
    }

    if (!config.USE_AWS_S3) {
      this.service.storeLocalMedia(req, res, tokenData.username);
    } else {
      this.service.uploadMediaToAWS(req, tokenData.username);
    }
  });

  public getListRecording = AsyncHandler(async (req, res) => {
    const owner = (req.query.owner as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await this.service.getListRecording(owner, page, limit);
    return new SuccessResponse("OK", data).send(res);
  });

  public downloadMedia = AsyncHandler(async (req, res) => {
    const fileName = req.params.filename;
    if (!config.USE_AWS_S3) {
      this.service.downloadLocalMedia(fileName, res);
    } else {
      this.service.downloadS3Media(fileName, res);
    }
  });
}

export default {
  RecordingController,
};

import * as config from "@appConfig";
import AsyncHandler from "../utils/AsyncHandler";
import { ForbiddenResponse, SuccessResponse } from "../utils/ApiResponse";
import { RecordingService } from "src/services/Recording";

/**
 * @swagger
 * tags:
 *   name: Recording
 *   description: Apis for recording
 */
export class RecordingController {
  private service: RecordingService;
  constructor() {
    this.service = new RecordingService();
  }

  /**
   * @openapi
   * /recordings/{recordingToken}:
   *   post:
   *     description: Record media
   *     parameters:
   *       - in: path
   *         name: recordingToken
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Media recorded successfully
   *       403:
   *         description: Forbidden
   */
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

  /**
   * @openapi
   * /recordings/:
   *   get:
   *     description: Get list of recordings
   *     parameters:
   *       - in: query
   *         name: owner
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A list of recordings
   */
  public getListRecording = AsyncHandler(async (req, res) => {
    const owner = (req.query.owner as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await this.service.getListRecording(owner, page, limit);
    return new SuccessResponse("OK", data).send(res);
  });

  /**
   * @openapi
   * /recordings/download/{filename}:
   *   get:
   *     description: Download media
   *     parameters:
   *       - in: path
   *         name: filename
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Media downloaded successfully
   */
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

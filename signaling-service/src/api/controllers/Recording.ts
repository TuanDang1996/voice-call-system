import config from "@/config";
import AsyncHandler from "@/api/utils/AsyncHandler";
import {
  ForbiddenResponse,
  InternalErrorResponse,
  SuccessResponse,
} from "@/api/utils/ApiResponse";
import { RecordingService } from "@/services/Recording";
import { MediaStoringService } from "@/services/MediaStoring";

/**
 * @swagger
 * tags:
 *   name: Recording
 *   description: Apis for Recording Feature
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
   *     summary: Record call/video
   *     description: Record media
   *     tags: [Recording]
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
      this.service.uploadRecordingToLocal(req, res, tokenData.username);
    } else {
      this.service.uploadRecordingToAWS(req, tokenData.username);
    }
  });

  /**
   * @openapi
   * /recordings/:
   *   get:
   *     summary: Get list of recordings
   *     description: Get list of recordings
   *     tags: [Recording]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           example: 10
   *     responses:
   *       200:
   *         description: A list of recordings
   */
  public getListRecording = AsyncHandler(async (req, res) => {
    const owner = req.decodedToken.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await this.service.getListRecording(owner, page, limit);
    return new SuccessResponse("OK", data).send(res);
  });

  /**
   * @openapi
   * /recordings/download/{filename}:
   *   get:
   *     summary: Download media
   *     description: Download media
   *     tags: [Recording]
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
      this.service.downloadRecordingFromLocal(fileName, res);
    } else {
      this.service.downloadRecordingFromS3(fileName, res);
    }
  });

  /**
   * @swagger
   * /recordings/stream/{filename}:
   *   get:
   *     summary: Stream Recording
   *     description: Stream Recording
   *     tags: [Recording]
   *     parameters:
   *       - in: path
   *         name: filename
   *         schema:
   *           type: string
   *         description: The file name
   *     responses:
   *       200:
   *         description: OK
   */
  public streamRecording = AsyncHandler(async (req, res) => {
    const decodedToken = req.decodedToken;
    const fileName = req.params.filename;
    MediaStoringService.steamS3Media(fileName, res, (err) => {
      return new InternalErrorResponse().send(res);
    });
  });
}

export default {
  RecordingController,
};

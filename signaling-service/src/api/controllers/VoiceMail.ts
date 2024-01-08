import * as config from "@appConfig";
import AsyncHandler from "../utils/AsyncHandler";
import { ForbiddenResponse, SuccessResponse } from "../utils/ApiResponse";
import { VoiceMailService } from "src/services/VoiceMail";

/**
 * @swagger
 * tags:
 *   name: VoiceMail
 *   description: Apis for VoiceMail Feature
 */
export class VoiceMailController {
  private voiceMailService: VoiceMailService;
  constructor() {
    this.voiceMailService = new VoiceMailService();
  }

  /**
   * @swagger
   * /voicemails/:
   *   get:
   *     summary: Retrieve a list of voicemails
   *     tags: [VoiceMail]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           example: 1
   *         description: The page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           example: 10
   *         description: The number of items to return per page
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: ['INCOMING','OUTGOING']
   *         description: The type of voicemail
   *     responses:
   *       200:
   *         description: A list of voicemails
   */
  public getVoiceMails = AsyncHandler(async (req, res) => {
    const decodedToken = req.decodedToken;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const rs = await this.voiceMailService.getVoiceMails(
      decodedToken.userId,
      page,
      limit,
      type
    );

    return new SuccessResponse("OK", rs).send(res);
  });

  /**
   * @openapi
   * /voicemails/{recordingToken}:
   *   post:
   *     summary: Record voice mail
   *     description: Record voice mail
   *     tags: [VoiceMail]
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
  public recordVoiceMail = AsyncHandler(async (req, res) => {
    const tokenData = this.voiceMailService.decodeRecordingVoiceMailToken(
      req.params.recordingToken
    );

    if (!tokenData) {
      return new ForbiddenResponse().send(res);
    }

    const sender = tokenData.sender;
    const recipient = tokenData.recipient;

    if (!config.USE_AWS_S3) {
      this.voiceMailService.uploadVoiceMailToLocal(req, res, sender, recipient);
    } else {
      this.voiceMailService.uploadRecordingToAWS(req, sender, recipient);
    }
  });
}

export default {
  VoiceMailController,
};

import * as config from "@appConfig";
import AsyncHandler from "../utils/AsyncHandler";
import { ForbiddenResponse, SuccessResponse } from "../utils/ApiResponse";
import services from "../services";

const recordMedia = AsyncHandler(async (req, res) => {
  const tokenData = services.recording.decodeRecordingToken(
    req.params.recordingToken
  );

  if (!tokenData) {
    return new ForbiddenResponse().send(res);
  }

  if (!config.USE_AWS_S3) {
    services.recording.storeMedia(req, res, tokenData.username);
  } else {
    services.recording.uploadMediaToAWS(req, tokenData.username);
  }
});

const getListRecording = AsyncHandler(async (req, res) => {
  const owner = (req.query.owner as string) || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const data = services.recording.getListRecording(owner, page, limit);
  return new SuccessResponse("OK", data).send(res);
});

export default {
  recordMedia,
  getListRecording,
};

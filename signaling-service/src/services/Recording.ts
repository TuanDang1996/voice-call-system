import { Request, Response } from "express";
import fs from "fs";
import {
  SuccessResponse,
  InternalErrorResponse,
  NotFoundResponse,
} from "@/api/utils/ApiResponse";
import AWS from "aws-sdk";
import config from "@/config";
import path from "path";
import { UserSession } from "@/model/UserSession";
import jwt from "jsonwebtoken";
import { TRecordingToken } from "@/types/Token";
import { v4 } from "uuid";
import { TPaginationResponse } from "@/types/Pagination";
import { RecordingRepository } from "@/repository/Recording";
import { MediaStoringService } from "@/services/MediaStoring";

export class RecordingService {
  private _s3: AWS.S3 | null;
  public repo: RecordingRepository;

  constructor() {
    this._s3 = config.USE_AWS_S3
      ? new AWS.S3({
          endpoint: config.AWS_S3_ENDPOINT,
          s3ForcePathStyle: true, // needed with LocalStack
          accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
          secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
          region: config.AWS_S3_REGION,
        })
      : null;

    this.repo = new RecordingRepository();
  }

  private _generateMediaFileName = (username: string) => {
    const dat = new Date().toISOString().replace(/[:.]/g, "-");
    return `recording_${username}_${v4()}_${dat}.webm`;
  };

  public static generateRecorderURI = (userSession: UserSession) => {
    const data: TRecordingToken = {
      username: userSession.name,
      sessionId: userSession.id,
    };
    const options = {
      expiresIn: "1h",
    };
    const recordingToken = jwt.sign(data, config.SECRET_KEY, options);
    return `${config.APP_ENDPOINT}${config.API_PREFIX}/recordings/${recordingToken}`;
  };

  public decodeRecordingToken = (recordingToken: string) => {
    try {
      const data = jwt.verify(recordingToken, config.SECRET_KEY);
      return data as TRecordingToken;
    } catch (err) {
      console.error("Error decoding recording token: ", err);
      return null;
    }
  };

  public uploadRecordingToLocal = (
    req: Request,
    res: Response,
    owner: string
  ) => {
    const self = this;
    const fileName = self._generateMediaFileName(owner);
    const filePath = path.join(config.MEDIA_PATH, fileName);
    MediaStoringService.storeLocalMedia(
      req,
      filePath,
      () => {
        self.repo.createRecording({
          owner: owner,
          key: fileName,
          url: MediaStoringService.generateDownloadableURI(fileName),
        });
        return new SuccessResponse("Upload finished", null).send(res);
      },
      () => {
        return new InternalErrorResponse("Upload failed").send(res);
      }
    );
  };

  public uploadRecordingToAWS = (req: Request, owner: string) => {
    let self = this;
    const fileName = self._generateMediaFileName(owner);
    MediaStoringService.uploadMediaToAWS(
      req,
      fileName,
      (data) => {
        console.log("Upload Success: ", data);
        self.repo.createRecording({
          owner: owner,
          key: data.Key,
          url: MediaStoringService.generateDownloadableURI(fileName),
        });
      },
      (err) => {
        console.log("Error while uploading media to s3", err);
      }
    );
  };

  public downloadRecordingFromLocal = (fileName: string, res: Response) => {
    MediaStoringService.downloadLocalMedia(
      fileName,
      res,
      () => {},
      (err) => {
        return new NotFoundResponse("Not found.").send(res);
      }
    );
  };

  public downloadRecordingFromS3 = (fileName: string, res: Response) => {
    MediaStoringService.downloadS3Media(
      fileName,
      (data) => {
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + fileName
        );
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(data.Body);
      },
      (err) => {
        return new NotFoundResponse("Not found.").send(res);
      }
    );
  };

  public getListRecording = async (
    owner: string,
    page: number,
    limit: number
  ): Promise<TPaginationResponse> => {
    const rs = await this.repo.getRecordingsByOwner(owner, page, limit);
    return rs;
  };
}

export default {
  RecordingService,
};

import { Request, Response } from "express";
import fs from "fs";
import {
  SuccessResponse,
  InternalErrorResponse,
  NotFoundResponse,
} from "../utils/ApiResponse";
import stream from "stream";
import AWS from "aws-sdk";
import * as config from "@appConfig";
import path from "path";
import { UserSession } from "src/model/UserSession";
import jwt from "jsonwebtoken";
import { TRecordingToken } from "src/types/Token";
import { v4 } from "uuid";
import { TPaginationResponse } from "src/types/Pagination";
import { RecordingRepository } from "src/repository/Recording";

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

  private _generateDownloadableURI = (fileName: string) => {
    return `${config.APP_ENDPOINT}${config.API_PREFIX}/recordings/download/${fileName}`;
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

  public storeLocalMedia = (req: Request, res: Response, owner: string) => {
    const self = this;
    const fileName = self._generateMediaFileName(owner);
    const filePath = path.join(config.MEDIA_PATH, fileName);
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);
    req.on("end", function () {
      console.log("Upload finished: ", filePath);
      self.repo.createRecording({
        owner: owner,
        key: fileName,
        url: self._generateDownloadableURI(fileName),
      });
      return new SuccessResponse("Upload finished", null).send(res);
    });
    req.on("error", function () {
      fs.unlinkSync(filePath); // Delete the file on error
      return new InternalErrorResponse("Upload failed").send(res);
    });
  };

  public uploadMediaToAWS = (req: Request, owner: string) => {
    let self = this;
    const fileName = self._generateMediaFileName(owner);
    const pass = new stream.PassThrough();
    req.pipe(pass);

    let params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: pass,
    };
    console.log("Begin uploading media to AWS S3: ", fileName);

    this._s3.upload(params, function (err, data) {
      if (err) {
        console.log("Error while uploading media to s3", err);
      }
      if (data) {
        console.log("Upload Success: ", data);
        self.repo.createRecording({
          owner: owner,
          key: data.Key,
          url: self._generateDownloadableURI(data.Key),
        });
      }
    });
  };

  public downloadLocalMedia = (fileName: string, res: Response) => {
    const file = path.resolve(
      __dirname,
      path.join(config.MEDIA_PATH, fileName)
    );
    res.download(file, fileName, function (err) {
      if (err) {
        console.log(err);
        return new NotFoundResponse("Not found.").send(res);
      } else {
        // Decrement a download credit, etc.
      }
    });
  };

  public downloadS3Media = (fileName: string, res: Response) => {
    const params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName,
    };
    this._s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        return new NotFoundResponse("Not found.").send(res);
      } else {
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + fileName
        );
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(data.Body);
      }
    });
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

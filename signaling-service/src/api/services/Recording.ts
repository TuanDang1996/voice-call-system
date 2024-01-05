import { Request, Response } from "express";
import fs from "fs";
import { SuccessResponse, InternalErrorResponse } from "../utils/ApiResponse";
import stream from "stream";

import AWS from "aws-sdk";
import * as config from "@appConfig";
import path from "path";
import { UserSession } from "src/model/UserSession";
import jwt from "jsonwebtoken";
import { TRecordingToken } from "src/types/Token";
import { v4 } from "uuid";
import Recording from "src/model/Recording";
import { TPaginationResponse } from "src/types/Pagination";

const s3 = new AWS.S3({
  endpoint: config.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true, // needed with LocalStack
  accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
  region: config.AWS_S3_REGION,
});

const generateFileName = (username: string) => {
  const dat = new Date().toISOString().replace(/[:.]/g, "-");
  return `recording_${username}_${v4()}_${dat}.webm`;
};

const generateRecorderURI = (userSession: UserSession) => {
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

const decodeRecordingToken = (recordingToken: string) => {
  try {
    const data = jwt.verify(recordingToken, config.SECRET_KEY);
    return data as TRecordingToken;
  } catch (err) {
    console.error("Error decoding recording token: ", err);
    return null;
  }
};

const storeMedia = (req: Request, res: Response, owner: string) => {
  const fileName = generateFileName(owner);
  const filePath = path.join(config.MEDIA_PATH, fileName);
  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);
  req.on("end", function () {
    console.log("Upload finished: ", filePath);
    const recordingRecord = new Recording({
      owner: owner,
      key: fileName,
      url: filePath,
    });
    recordingRecord.save();
    return new SuccessResponse("Upload finished", null).send(res);
  });
  req.on("error", function () {
    fs.unlinkSync(filePath); // Delete the file on error
    return new InternalErrorResponse("Upload failed").send(res);
  });
};

const uploadMediaToAWS = (req: Request, owner: string) => {
  const fileName = generateFileName(owner);
  const pass = new stream.PassThrough();
  req.pipe(pass);

  let params = {
    Bucket: config.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: pass,
  };
  console.log("Begin uploading media to AWS S3");
  console.log("File Name: ", fileName);

  s3.upload(params, function (err, data) {
    console.log("Finished uploading media to AWS S3");

    if (err) {
      console.log("Error", err);
    }
    if (data) {
      console.log("Upload Success: ", data);
      const recordingRecord = new Recording({
        owner: owner,
        key: data.Key,
        url: data.Location,
      });
      recordingRecord.save();
    }
  });
};

const getListRecording = async (
  owner: string,
  page: number,
  limit: number
): Promise<TPaginationResponse> => {
  const rs = await Promise.all([
    Recording.find({ owner: owner })
      .skip((page - 1) * limit)
      .limit(limit),
    Recording.countDocuments({}),
  ]);
  return {
    total: rs[1],
    data: rs[0],
    page: page,
    limit: limit,
  };
};

export default {
  s3,
  storeMedia,
  uploadMediaToAWS,
  generateFileName,
  generateRecorderURI,
  decodeRecordingToken,
  getListRecording,
};

import { Request, Response } from "express";
import fs from "fs";
import stream from "stream";
import AWS from "aws-sdk";
import config from "@/config";
import path from "path";

const S3 = config.USE_AWS_S3
  ? new AWS.S3({
      endpoint: config.AWS_S3_ENDPOINT,
      s3ForcePathStyle: true, // needed with LocalStack
      accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
      region: config.AWS_S3_REGION,
    })
  : null;

export class MediaStoringService {
  public static generateDownloadableURI = (fileName: string) => {
    return `${config.APP_ENDPOINT}${config.API_PREFIX}/recordings/download/${fileName}`;
  };

  public static storeLocalMedia = (
    req: Request,
    filePath: string,
    onSuccess: () => void,
    onError: () => void
  ) => {
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);
    req.on("end", function () {
      console.log("Upload finished: ", filePath);
      return onSuccess();
    });
    req.on("error", function () {
      fs.unlinkSync(filePath); // Delete the file on error
      return onError();
    });
  };

  public static uploadMediaToAWS = (
    req: Request,
    fileName: string,
    onSuccess: (data: any) => void,
    onError: (err: any) => void
  ) => {
    const pass = new stream.PassThrough();
    req.pipe(pass);
    let params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: pass,
    };
    console.log("Begin uploading media to AWS S3: ", fileName);

    S3.upload(params, function (err, data) {
      if (err) {
        console.log("Error while uploading media to s3", err);
        return onError(err);
      }
      if (data) {
        console.log("Upload Success: ", data);
        return onSuccess(data);
      }
    });
  };

  public static downloadLocalMedia = (
    fileName: string,
    res: Response,
    onSuccess: () => void,
    onError: (err: any) => void
  ) => {
    const file = path.resolve(
      __dirname,
      path.join(config.MEDIA_PATH, fileName)
    );
    res.download(file, fileName, function (err) {
      if (err) {
        console.log(err);
        return onError(err);
      } else {
        return onSuccess();
      }
    });
  };

  public static downloadS3Media = (
    fileName: string,
    onSuccess: (data: any) => void,
    onError: (err: any) => void
  ) => {
    const params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName,
    };
    S3.getObject(params, function (err, data) {
      if (err) {
        return onError(err);
      } else {
        return onSuccess(data);
      }
    });
  };

  public static steamS3Media = (
    fileName: string,
    res: Response,
    onError: (err) => void
  ) => {
    const params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Key: fileName,
    };

    S3.headObject(params, function (err, data) {
      if (err) {
        // an error occurred
        return onError(err);
      }
      var stream = S3.getObject(params).createReadStream();

      // forward errors
      stream.on("error", function error(err) {
        //continue to the next middlewares
        return onError(err);
      });

      res.set("ETag", data.ETag);

      //Pipe the s3 object to the response
      stream.pipe(res);
    });
  };
}

export default {
  MediaStoringService,
};

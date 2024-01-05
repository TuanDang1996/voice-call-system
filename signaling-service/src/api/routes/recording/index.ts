import express from "express";
import AsyncHandler from "../../utils/AsyncHandler";
import fs from "fs";
import * as config from "@appConfig";
import {
  SuccessResponse,
  InternalErrorResponse,
  ForbiddenResponse,
} from "../../utils/ApiResponse";
import stream from "stream";
import AWS from "aws-sdk";

const router = express.Router();

router.post(
  "/:secretKey/record.webm",
  AsyncHandler(async (req, res) => {
    if (req.params.secretKey !== config.SECRET_KEY) {
      return new ForbiddenResponse().send(res);
    }
    // Create a pass through stream
    if (!config.USE_AWS_S3) {
      const filePath = "./record.webm";
      const writeStream = fs.createWriteStream(filePath);
      req.pipe(writeStream);
      req.on("end", function () {
        console.log("Upload finished");
        return new SuccessResponse("Upload finished", null).send(res);
      });

      req.on("error", function () {
        fs.unlinkSync(filePath); // Delete the file on error
        return new InternalErrorResponse("Upload failed").send(res);
      });
    } else {
      // Upload the stream data to S3
      const pass = new stream.PassThrough();
      const s3 = new AWS.S3({
        endpoint: config.AWS_S3_ENDPOINT,
        s3ForcePathStyle: true, // needed with LocalStack
        accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
        region: config.AWS_S3_REGION,
      });

      let params = {
        Bucket: config.AWS_S3_BUCKET_NAME,
        Key: "test",
        Body: pass,
      };

      s3.upload(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        }
        if (data) {
          console.log("Upload Success", data.Location);
        }
      });

      // Pipe the incoming request to the pass through stream
      req.pipe(pass);
    }
  })
);

export default router;

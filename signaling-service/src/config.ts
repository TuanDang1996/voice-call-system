require("dotenv").config();
import path from "path";

// Kurento Media Server
export const KMS_HOST = process.env.MEDIA_SERVER_HOST || "0.0.0.0";
export const KMS_PORT = process.env.MEDIA_SERVER_PORT || "8899";
export const KMS_SCHEME = process.env.MEDIA_SERVER_SCHEME || "ws";
export const KMS_URI = `${KMS_SCHEME}://${KMS_HOST}:${KMS_PORT}/kurento`;

// Signaling Server
export const SECRET_KEY = process.env.SECRET_KEY;
export const APP_HOST = process.env.APP_SERVER_HOST || "0.0.0.0";
export const APP_USE_SSL = process.env.APP_USE_SSL === "1" || false;
export const APP_PORT = process.env.APP_SERVER_PORT || "8444";
export const APP_ENDPOINT = `${
  APP_USE_SSL ? "https" : "http"
}://${APP_HOST}:${APP_PORT}`;

export const STATIC_PATH =
  process.env.STATIC_PATH || path.join(__dirname, "../public");
export const IS_DEBUG = process.env.DEBUG === "1" || false;
export const API_PREFIX = process.env.API_PREFIX || "/api";
export const MEDIA_PATH =
  process.env.MEDIA_PATH || path.join(__dirname, "../media");

// AWS S3
export const USE_AWS_S3 = process.env.USE_AWS_S3 === "1" || false;
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "test";
export const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID || "test";
export const AWS_S3_SECRET_ACCESS_KEY =
  process.env.AWS_S3_SECRET_ACCESS_KEY || "test";
export const AWS_S3_REGION = process.env.AWS_S3_REGION || "us-east-1";
export const AWS_S3_ENDPOINT =
  process.env.AWS_S3_ENDPOINT || "http://0.0.0.0:4566";

// MongoDB
export const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017";

export * as default from "./config";

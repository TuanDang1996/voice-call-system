import { TBearerPayloadToken } from "./types/Token";

declare global {
  namespace Express {
    export interface Request {
      decodedToken?: TBearerPayloadToken;
    }
  }
}

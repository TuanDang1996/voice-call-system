import { TBearerPayloadToken } from "@/types/Token";
import { Request } from "express";

export class AuthService {
  public verifyToken(req: Request): TBearerPayloadToken {
    // TODO: Implement this method
    return {
      username: "testUser",
      userId: "testUserId",
    };
  }
}

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  //   const authHeader = req.headers.authorization;

  //   if (authHeader) {
  //     const token = authHeader.split(' ')[1]; // Assume Bearer schema

  //     jwt.verify(token, 'your-secret-key', (err, user) => {
  //       if (err) {
  //         return res.sendStatus(403);
  //       }

  //       req.user = user;
  //       next();
  //     });
  //   } else {
  //     res.sendStatus(401);
  //   }

  // TODO: Wait for the real implementation
  req.decodedToken = {
    username: "testUser",
    userId: "testUser",
  };
  next();
};

export default authMiddleware;

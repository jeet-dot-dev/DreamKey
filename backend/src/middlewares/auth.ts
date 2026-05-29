import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// 👇 Define what your token contains
interface JwtPayload {
  userId: string;
}

// 👇 Extend Request type to include user
interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Check Bearer format properly
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({
        message: "Token required",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        message: "Token missing",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as unknown as JwtPayload;

    // ✅ Attach user
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

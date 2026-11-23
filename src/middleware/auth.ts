import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { email: string; name: string; role: string };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: missing token" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
      name: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const verifyOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "Owner" && req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Owner access required" });
  }
  next();
};

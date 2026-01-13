import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "~/config/environment";

export const authMiddleware = {
  verifyToken: (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      req.user = decoded;

      next();
    } catch (error) {
      console.log(error);

      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }
  },
  verifyAdmin: (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Ban chua dang nhap!",
      });
    }
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Ban khong co quyen truy cap!",
      });
    }
  },
};

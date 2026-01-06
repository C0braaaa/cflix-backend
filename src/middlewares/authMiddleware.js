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
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
      });
    }
  },
};

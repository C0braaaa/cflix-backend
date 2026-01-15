import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    message: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút!",
  },
  handler: (req, res, next, options) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const commonLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    message: "Server đang bận, vui lòng thử lại sau giây lát!",
  },
  handler: (req, res, next, options) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json(options.message);
  },
});

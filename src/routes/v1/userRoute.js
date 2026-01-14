import express from "express";
import { userController } from "~/controllers/userController";
import { authMiddleware } from "~/middlewares/authMiddleware";
import { commonLimiter } from "~/middlewares/rateLimitMiddleware";

const Router = express.Router();

Router.put(
  "/update",
  commonLimiter,
  authMiddleware.verifyToken,
  userController.update
);

Router.get(
  "/all-users",
  commonLimiter,
  authMiddleware.verifyToken,
  userController.getAllUSers
);

Router.get(
  "/me",
  commonLimiter,
  authMiddleware.verifyToken,
  userController.getDetailUser
);

Router.put(
  "/admin/update/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  userController.updateUserByID
);

Router.post(
  "/favorite",
  authMiddleware.verifyToken,
  userController.toggleFavorite
);
export const userRoute = Router;

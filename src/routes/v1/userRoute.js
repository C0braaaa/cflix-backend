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

Router.post(
  "/playlist",
  authMiddleware.verifyToken,
  userController.togglePlaylist
);

Router.post(
  "/continue-watching",
  authMiddleware.verifyToken,
  userController.saveProgress
);

Router.delete(
  "/continue-watching",
  authMiddleware.verifyToken,
  userController.removeContinueWatching
);

Router.delete(
  "/user/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  userController.deleteUser
);

Router.get(
  "/favorite",
  authMiddleware.verifyToken,
  userController.getFavorites
);
Router.get("/playlist", authMiddleware.verifyToken, userController.getPlaylist);
Router.get(
  "/continue-watching",
  authMiddleware.verifyToken,
  userController.getContinueWatching
);
export const userRoute = Router;

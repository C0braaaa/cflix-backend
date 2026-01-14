import express from "express";
import { authValidation } from "~/validations/authValidations";
import { authController } from "~/controllers/authController";
import { authMiddleware } from "~/middlewares/authMiddleware";
import { authLimiter, commonLimiter } from "~/middlewares/rateLimitMiddleware";

const Router = express.Router();

Router.post("/login", authLimiter, authValidation.login, authController.login);
Router.post("/login-google", authLimiter, authController.loginGoogle);
Router.post(
  "/register",
  authLimiter,
  authValidation.register,
  authController.register
);

Router.post("/logout", authController.logout);

Router.post(
  "/playlist",
  authMiddleware.verifyToken,
  authController.togglePlaylist
);

Router.post(
  "/continue-watching",
  authMiddleware.verifyToken,
  authController.saveProgress
);

Router.delete(
  "/continue-watching",
  authMiddleware.verifyToken,
  authController.removeContinueWatching
);

Router.delete(
  "/user/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  authController.deleteUser
);

Router.get(
  "/favorite",
  authMiddleware.verifyToken,
  authController.getFavorites
);
Router.get("/playlist", authMiddleware.verifyToken, authController.getPlaylist);
Router.get(
  "/continue-watching",
  authMiddleware.verifyToken,
  authController.getContinueWatching
);
export const authRoute = Router;

import express from "express";
import { authValidation } from "~/validations/authValidations";
import { authController } from "~/controllers/authController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.post("/login", authValidation.login, authController.login);
Router.post("/register", authValidation.register, authController.register);
Router.put("/update", authMiddleware.verifyToken, authController.update);
Router.put(
  "/admin/update/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  authController.updateUserByID
);
Router.get("/me", authMiddleware.verifyToken, authController.getMe);
Router.get(
  "/all-users",
  authMiddleware.verifyToken,
  authController.getAllUSers
);
Router.post("/logout", authController.logout);
Router.post(
  "/favorite",
  authMiddleware.verifyToken,
  authController.toggleFavorite
);
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
export const authRoute = Router;

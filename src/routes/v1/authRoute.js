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
  authController.updateUserByID
);
Router.get("/me", authMiddleware.verifyToken, authController.getMe);
Router.get(
  "/all-users",
  authMiddleware.verifyToken,
  authController.getAllUSers
);
Router.post("/logout", authController.logout);

export const authRoute = Router;

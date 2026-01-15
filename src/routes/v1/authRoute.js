import express from "express";
import { authValidation } from "~/validations/authValidations";
import { authController } from "~/controllers/authController";
import { authLimiter } from "~/middlewares/rateLimitMiddleware";

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

Router.post("/forgot-password", authLimiter, authController.forgotPassword);
Router.post("/reset-password", authLimiter, authController.resetPassword);
Router.post("/verify-token", authController.verifyTokenResetPass);
export const authRoute = Router;

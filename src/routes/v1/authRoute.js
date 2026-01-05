import express from "express";
import { authValidation } from "~/validations/authValidations";
import { authController } from "~/controllers/authController";

const Router = express.Router();

Router.post("/login", authValidation.login, authController.login);

export const authRoute = Router;

import { chatbotController } from "~/controllers/chatbotController";
import express from "express";

const Router = express.Router();

Router.route("/").post(chatbotController.chat);

export const chatbotRoutes = Router;

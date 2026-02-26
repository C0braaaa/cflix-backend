import express from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";
import { sliderRoute } from "./sliderRoute";
import { commentRoute } from "./commentRoute";
import { ratingRoute } from "./ratingRoute";
import { viewsRoute } from "./viewsRoute";
import { notificationRoute } from "./notificationRoute";
import { chatbotRoutes } from "./chatbotRoute";
import { reportRoute } from "./reportRoute";

const Router = express.Router();

Router.use("/auth", authRoute);
Router.use("/user", userRoute);
Router.use("/slider", sliderRoute);
Router.use("/comment", commentRoute);
Router.use("/rating", ratingRoute);
Router.use("/trending", viewsRoute);
Router.use("/notifications", notificationRoute);
Router.use("/chatbot", chatbotRoutes);
Router.use("/report", reportRoute);
export const APIs_V1 = Router;

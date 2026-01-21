import express from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";
import { sliderRoute } from "./sliderRoute";
import { commentRoute } from "./commentRoute";

const Router = express.Router();

Router.use("/auth", authRoute);
Router.use("/user", userRoute);
Router.use("/slider", sliderRoute);
Router.use("/comment", commentRoute);
export const APIs_V1 = Router;

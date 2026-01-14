import express from "express";
import { authRoute } from "./authRoute";
import { userRoute } from "./userRoute";

const Router = express.Router();

Router.use("/auth", authRoute);
Router.use("/user", userRoute);

export const APIs_V1 = Router;

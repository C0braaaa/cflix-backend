import express from "express";
import { authRoute } from "./authRoute";
import { StatusCodes } from "http-status-codes";

const Router = express.Router();

Router.get("status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "APIs v1 already to use!" });
});

Router.use("/auth", authRoute);

export const APIs_V1 = Router;

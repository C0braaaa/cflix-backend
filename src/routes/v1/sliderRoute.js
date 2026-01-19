import express from "express";
import { sliderController } from "~/controllers/sliderController";

const Router = express.Router();

Router.get("/hot", sliderController.getAllSliders);

export const sliderRoute = Router;

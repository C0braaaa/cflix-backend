import express from "express";
import { sliderController } from "~/controllers/sliderController";
import { authMiddleware } from "~/middlewares/authMiddleware";
const Router = express.Router();

Router.get("/hot", sliderController.getAllSliders);
Router.post(
  "/add",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  sliderController.createNewSlider,
);
Router.delete(
  "/sliders/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  sliderController.deleteSlider,
);

Router.put(
  "/sliders/:id",
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  sliderController.updateSlider,
);

export const sliderRoute = Router;

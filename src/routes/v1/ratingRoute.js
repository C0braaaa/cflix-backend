import { ratingController } from "~/controllers/ratingController";
import express from "express";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();
Router.post("/like", authMiddleware.verifyToken, ratingController.toggleLike);
Router.post(
  "/dislike",
  authMiddleware.verifyToken,
  ratingController.toggleDislike,
);
Router.get(
  "/:slug",
  authMiddleware.checkTokenOptional,
  ratingController.getRating,
);

export const ratingRoute = Router;

import express from "express";
import { commentController } from "~/controllers/commentController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.post("/add", authMiddleware.verifyToken, commentController.addComment);
Router.get("/:slug", commentController.getCommentBySlug);
Router.put(
  "/vote/:id",
  authMiddleware.verifyToken,
  commentController.toggleVoteComment,
);
Router.delete(
  "/:id",
  authMiddleware.verifyToken,
  commentController.deleteComment,
);
export const commentRoute = Router;

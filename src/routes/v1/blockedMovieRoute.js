import express from "express";
import { blockedMovieController } from "~/controllers/blockedMovieController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

// Admin routes
Router.route("/block")
  .post(
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    blockedMovieController.blockMovie
  );

Router.route("/:slug/unblock")
  .put(
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    blockedMovieController.unblockMovie
  );

Router.route("/blocked")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    blockedMovieController.getAllBlocked
  );

Router.route("/blocked-slugs")
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    blockedMovieController.getAllBlockedSlugs
  );

// Public route for checking if a movie is blocked
Router.route("/:slug/status")
  .get(blockedMovieController.checkStatus);

export const blockedMovieRoute = Router;

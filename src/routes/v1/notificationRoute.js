import express from "express";
import { notificationCotroller } from "~/controllers/notificationController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.route("/").get(
  authMiddleware.verifyToken,
  notificationCotroller.getMyNotifications,
);
Router.route("/read-all").put(
  authMiddleware.verifyToken,
  notificationCotroller.markAllAsRead,
);
Router.route("/:id/read").put(
  authMiddleware.verifyToken,
  notificationCotroller.markAsRead,
);
Router.route("/:id").delete(
  authMiddleware.verifyToken,
  notificationCotroller.deleteNotify,
);

export const notificationRoute = Router;

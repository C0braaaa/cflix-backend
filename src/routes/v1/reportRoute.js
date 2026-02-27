import express from "express";
import { reportController } from "~/controllers/reportController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.route("/stats").get(
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  reportController.getReportStats,
);

Router.route("/")
  .post(authMiddleware.verifyToken, reportController.createReport)
  .get(
    authMiddleware.verifyToken,
    authMiddleware.verifyAdmin,
    reportController.getAllReports,
  );

Router.route("/:id").delete(
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  reportController.deleteReport,
);

Router.route("/:id/status").put(
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  reportController.upadteStatus,
);
export const reportRoute = Router;

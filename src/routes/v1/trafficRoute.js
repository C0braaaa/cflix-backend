import express from "express";
import { trafficController } from "~/controllers/trafficCOntroller";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

Router.route("/record").post(trafficController.recordVisit);
Router.route("/stats").get(
  authMiddleware.verifyToken,
  authMiddleware.verifyAdmin,
  trafficController.getTrafficStats,
);

export const trafficRoute = Router;

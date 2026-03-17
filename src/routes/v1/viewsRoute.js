import express from "express";
import { viewsController } from "~/controllers/viewsController";

const Router = express.Router();

Router.post("/views", viewsController.increaseView);
Router.get("/views", viewsController.getTopViewed);
Router.get("/views/:slug", viewsController.getViewsBySlug);
export const viewsRoute = Router;

import express from "express";
import { notificationController } from "~/controllers/notificationController";
import { authMiddleware } from "~/middlewares/authMiddleware";

const Router = express.Router();

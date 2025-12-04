import express from "express";
import {StatusCodes} from 'http-status-codes';
import { authRoute } from "./authRoute";

const Router = express.Router();

Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({status:StatusCodes.OK,message: 'APIs V1 are ready to use.', user: '', })
})

//auth APIs
Router.use('/auth', authRoute)

export const APIs_V1 = Router;

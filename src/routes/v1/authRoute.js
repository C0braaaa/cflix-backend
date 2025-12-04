import express from "express";
import {StatusCodes} from 'http-status-codes';

const Router = express.Router();

Router.route('/')
    .get((req, res) => {
        res.status(StatusCodes.OK).json({mesage: 'Get user from database.'})
    })
    .post((req, res) => {
        res.status(StatusCodes.CREATED).json({mesage: 'Add new user to database.'})
    })

export const authRoute = Router;

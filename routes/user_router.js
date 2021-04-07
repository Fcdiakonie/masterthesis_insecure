import express from 'express';
import {userController} from "../controllers/user_controller.js";

let userRouter = express.Router();

userRouter.post('', (req, res) => userController.insertUser(res, req))
userRouter.post('/login', (req, res) => userController.getUser(res, req))
userRouter.get('/deletebyid/:id', (req, res) => userController.deleteUser(req, res))

export {userRouter}
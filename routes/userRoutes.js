import { Router } from "express";
import * as userController from "../controllers/userController.js"
import authMailer from "../middlewares/authMailer.js";

const userRouter = new Router();

userRouter.get('/test', userController.test);

userRouter.post('/register', userController.register);
userRouter.get('/validateUserRegister/:token?', authMailer, userController.validateRegister); // quedará como get de manera temporal despues cambiar a post
userRouter.post('/login', userController.login);

export default userRouter;
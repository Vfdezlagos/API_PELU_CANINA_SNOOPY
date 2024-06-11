import { Router } from "express";
import * as userController from "../controllers/userController.js"
import authMailer from "../middlewares/authMailer.js";
import auth from "../middlewares/auth.js";

const userRouter = new Router();

userRouter.get('/test', userController.test);

// Registro de usuario
userRouter.post('/register', userController.register);
userRouter.get('/validateUserRegister/:token?', authMailer, userController.validateRegister); // quedará como get de manera temporal despues cambiar a post

// Login y password recovery
userRouter.post('/login', userController.login);
userRouter.post('/passwordChange', userController.passwordChange);
userRouter.post('/passwordReset/:token?', authMailer, userController.passwordReset);

// Listar usuarios (solo puede acceder el admin)
userRouter.get('/list', auth, userController.list);
userRouter.get('/findbyid/:id?', auth, userController.findById);

// Actualizar usuario
userRouter.patch('/update/:id?', userController.update);

// Eliminar usuario
userRouter.post('/delete/:id?', userController.deleteUser);

export default userRouter;
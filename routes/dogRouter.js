import { Router } from "express";
import * as dogController from "../controllers/dogController.js"
import auth from '../middlewares/auth.js';

const dogRouter = new Router();

dogRouter.get('/test', dogController.test);

dogRouter.post('/register', auth, dogController.register);


export default dogRouter;
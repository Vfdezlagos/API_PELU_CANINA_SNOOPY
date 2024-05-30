import { Router } from "express";
import * as dogController from "../controllers/dogController.js"
import auth from '../middlewares/auth.js';
import multer from "multer";

// Crear Router
const dogRouter = new Router();

// Configuracion de subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/dogs/');
    },
    filename: (req, file, cb) => {
        cb(null, 'Dog-' + Date.now() + '-' + file.originalname);
    }
});

const uploads = multer({storage});

// Rutas
dogRouter.get('/test', dogController.test);

dogRouter.post('/register', auth, dogController.register);

// Exportar Router
export default dogRouter;
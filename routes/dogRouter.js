import { Router } from "express";
import * as dogController from "../controllers/dogController.js"
import auth from '../middlewares/auth.js';
import multer from "multer";
import fs from "node:fs";

// Crear Router
const dogRouter = new Router();

// Crear directorio upload si no existe
if(!fs.existsSync('public/images/uploads/')) {
    fs.mkdirSync('public/images/uploads/');
}

// crear directorio de imagenes de perros si no existe
if(!fs.existsSync('public/images/uploads/dogs')) {
    fs.mkdirSync('public/images/uploads/dogs/');
}

// Configuracion de subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads/dogs/');
    },
    filename: (req, file, cb) => {
        cb(null, 'Dog-' + Date.now() + '-' + file.originalname);
    }
});

const uploads = multer({storage});

// Rutas
dogRouter.get('/test', dogController.test);

// registro de perro y subida de imagen
dogRouter.post('/register', auth, dogController.register);
dogRouter.post('/upload', [auth, uploads.single('file0')], dogController.uploadDogImage);

// listar perros del usuario identificado
dogRouter.get('/list', auth, dogController.dogList);

// mostrar imagen del perro
dogRouter.get('/showimage/:id?', dogController.showImage);

// Exportar Router
export default dogRouter;
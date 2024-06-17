import * as bannerController from '../controllers/bannerController.js';
import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';

const bannerRouter = new Router();

// Crear directorio upload si no existe
if(!fs.existsSync('public/images/uploads/')) {
    fs.mkdirSync('public/images/uploads/');
}

// crear directorio de imagenes de perros si no existe
if(!fs.existsSync('public/images/uploads/banners')) {
    fs.mkdirSync('public/images/uploads/banners/');
}

// Configuracion de subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads/banners/');
    },
    filename: (req, file, cb) => {
        cb(null, 'Banner-' + Date.now() + '-' + file.originalname);
    }
});

const uploads = multer({storage});


// Rutas
bannerRouter.get('/test', bannerController.test);

bannerRouter.post('/register', bannerController.register);
bannerRouter.patch('/update/:id?', bannerController.update);
bannerRouter.patch('/updateimage', uploads.single('image'), bannerController.updateImage);
bannerRouter.get('/list/:page?', bannerController.listBanners);
bannerRouter.get('/listDisabled/:page?', bannerController.listDisabled);
bannerRouter.get('/find/:id?', bannerController.getBannerById);
bannerRouter.patch('/changeStatus/:id?', bannerController.changeStatus);
bannerRouter.post('/delete/:id?', bannerController.deleteBanner);

export default bannerRouter;
import * as bannerController from '../controllers/bannerController.js';
import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import auth from '../middlewares/auth.js';

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

// registro
bannerRouter.post('/register', auth, bannerController.register);

// actualizacion
bannerRouter.patch('/update/:id?', auth, bannerController.update);
bannerRouter.patch('/updateimage', auth, uploads.single('image'), bannerController.updateImage);

// listar
bannerRouter.get('/list/:page?', bannerController.listBanners);
bannerRouter.get('/listDisabled/:page?', auth, bannerController.listDisabled);
bannerRouter.get('/find/:id?', auth, bannerController.getBannerById);
bannerRouter.get('/showimage/:id?', bannerController.showImage);

// eliminar
bannerRouter.patch('/changeStatus/:id?', auth, bannerController.changeStatus);
bannerRouter.post('/delete/:id?', auth, bannerController.deleteBanner);

export default bannerRouter;
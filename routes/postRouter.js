import { Router } from "express";
import multer from "multer";
import auth from '../middlewares/auth.js';
import * as postController from '../controllers/postController.js';
import fs from 'node:fs';

// Crear Router
const postRouter = new Router();

// Crear directorio upload si no existe
if(!fs.existsSync('public/images/uploads/')) {
    fs.mkdirSync('public/images/uploads/');
}

// crear directorio de imagenes de perros si no existe
if(!fs.existsSync('public/images/uploads/posts')) {
    fs.mkdirSync('public/images/uploads/posts/');
}

// Configuracion de subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/uploads/posts/');
    },
    filename: (req, file, cb) => {
        cb(null, 'Post-' + Date.now() + '-' + file.originalname);
    }
});

const uploads = multer({storage});

postRouter.get('/test', postController.test);

// registro de post
postRouter.post('/register', auth, postController.register);

// Actualizar post y actualizar imagenes
postRouter.post('/update/:id?', auth, postController.updatePost);
postRouter.post('/updateimage1', [auth, uploads.single('image')], postController.updatePostImage1);
postRouter.post('/updateimage2', [auth, uploads.single('image')], postController.updatePostImage2);

// mostrar imagenes del post
postRouter.get('/showImage/:id?/:number?', postController.showImage);

// listar posts
postRouter.get('/list', postController.listPosts);
postRouter.get('/listPosts/:page?', postController.listPaginate);
postRouter.get('/listDisabled/:page?', auth, postController.listDisabledPaginate);
postRouter.get('/find/:id?', auth, postController.findPostById);

// eliminar post
postRouter.post('/delete/:id?', auth, postController.deletePostById);
postRouter.post('/changeStatus/:id?', auth, postController.changePostStatus);

export default postRouter;
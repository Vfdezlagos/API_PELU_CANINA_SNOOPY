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
postRouter.post('/register', auth, postController.register);
postRouter.get('/showImage/:id?/:number?', postController.showImage);
postRouter.get('/list', postController.listPosts);
postRouter.post('/delete/:id?', postController.deletePostById);
postRouter.patch('/update/:id?', postController.updatePost);
postRouter.patch('/updateimage1', uploads.single('image'), postController.updatePostImage1);
postRouter.patch('/updateimage2', uploads.single('image'), postController.updatePostImage2);

export default postRouter;
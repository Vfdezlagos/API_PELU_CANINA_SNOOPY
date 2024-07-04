import fs from 'fs';
import multer from 'multer';
import { Router } from 'express';
import postRouter from '../routes/postRouter';
import * as postController from '../controllers/postController';
import auth from '../middlewares/auth';

jest.mock('fs');
jest.mock('multer');
jest.mock('../controllers/postController');
jest.mock('../middlewares/auth');

describe('Post Router Configuration', () => {
  beforeAll(() => {
    fs.existsSync.mockImplementation((path) => {
      return path === 'public/images/uploads/' || path === 'public/images/uploads/posts';
    });
    fs.mkdirSync.mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create necessary directories if they do not exist', () => {
    // Se requiere el archivo para ejecutar la lógica de creación de directorios
    require('../router/postRouter'); 

    // Verifica que se llamó a fs.mkdirSync con las rutas correctas
    expect(fs.mkdirSync).toHaveBeenCalledWith('public/images/uploads/');
    expect(fs.mkdirSync).toHaveBeenCalledWith('public/images/uploads/posts/');
  });

  it('should configure multer storage correctly', () => {
    const storageConfig = multer.diskStorage.mock.calls[0][0];

    expect(storageConfig).toHaveProperty('destination');
    expect(storageConfig).toHaveProperty('filename');

    const cbMock = jest.fn();
    storageConfig.destination(null, null, cbMock);
    storageConfig.filename(null, { originalname: 'test.jpg' }, cbMock);

    expect(cbMock).toHaveBeenCalledWith(null, 'public/images/uploads/posts/');
    expect(cbMock).toHaveBeenCalledWith(null, expect.stringMatching(/^Post-\d+-test.jpg$/));
  });

  it('should define routes correctly', () => {
    const routes = [
      { method: 'get', path: '/test', middlewares: [postController.test] },
      { method: 'post', path: '/register', middlewares: [auth, postController.register] },
      { method: 'post', path: '/update/:id?', middlewares: [auth, postController.updatePost] },
      { method: 'post', path: '/updateimage1', middlewares: [auth, uploads.single('image'), postController.updatePostImage1] },
      { method: 'post', path: '/updateimage2', middlewares: [auth, uploads.single('image'), postController.updatePostImage2] },
      { method: 'get', path: '/showImage/:id?/:number?', middlewares: [postController.showImage] },
      { method: 'get', path: '/list', middlewares: [postController.listPosts] },
      { method: 'get', path: '/listPosts/:page?', middlewares: [postController.listPaginate] },
      { method: 'get', path: '/listDisabled/:page?', middlewares: [auth, postController.listDisabledPaginate] },
      { method: 'get', path: '/find/:id?', middlewares: [auth, postController.findPostById] },
      { method: 'post', path: '/delete/:id?', middlewares: [auth, postController.deletePostById] },
      { method: 'post', path: '/changeStatus/:id?', middlewares: [auth, postController.changePostStatus] },
      { method: 'patch', path: '/changeSelected/:id?', middlewares: [auth, postController.changeSelected] },
      { method: 'get', path: '/findSelected', middlewares: [postController.findSelected] },
    ];

    routes.forEach(route => {
      const stack = postRouter.stack.find(layer => layer.route && layer.route.path === route.path);
      expect(stack).toBeTruthy();
      expect(stack.route.stack[0].method).toBe(route.method);
      expect(stack.route.stack.map(m => m.name)).toEqual(route.middlewares.map(m => m.name));
    });
  });
});

import fs from 'fs';
import multer from 'multer';
import { Router } from 'express';
import dogRouter from '../routes/dogRouter';
import * as dogController from '../controllers/dogController';
import auth from '../middlewares/auth';

jest.mock('fs');
jest.mock('multer');
jest.mock('../controllers/dogController');
jest.mock('../middlewares/auth');

jest.mock('multer', () => {
  const multer = jest.fn(() => ({
    single: jest.fn()
  }));

  multer.diskStorage = jest.fn((config) => config);

  return multer;
});

describe('Dog Router Configuration', () => {
  beforeAll(() => {
    fs.existsSync.mockImplementation((path) => {
      return path === 'public/images/uploads/' || path === 'public/images/uploads/dogs';
    });
    fs.mkdirSync.mockImplementation(() => { });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create necessary directories if they do not exist', () => {
    require('../routes/dogRouter');

    expect(fs.mkdirSync).toHaveBeenCalledWith('public/images/uploads/');
    expect(fs.mkdirSync).toHaveBeenCalledWith('public/images/uploads/dogs/');
  });

  it('should configure multer storage correctly', () => {
    require('../routes/dogRouter'); // Asegúrate de requerir el archivo para configurar multer

    const storageConfig = multer.diskStorage.mock.calls[0][0];

    expect(storageConfig).toHaveProperty('destination');
    expect(storageConfig).toHaveProperty('filename');

    const cbMock = jest.fn();
    storageConfig.destination(null, null, cbMock);
    storageConfig.filename(null, { originalname: 'test.jpg' }, cbMock);

    expect(cbMock).toHaveBeenCalledWith(null, 'public/images/uploads/dogs/');
    expect(cbMock).toHaveBeenCalledWith(null, expect.stringMatching(/^Dog-\d+-test.jpg$/));
  });

  it('should define routes correctly', () => {
    require('../routes/dogRouter'); // Asegúrate de requerir el archivo para configurar las rutas

    const routes = [
      { method: 'get', path: '/test', middlewares: [dogController.test] },
      { method: 'post', path: '/register', middlewares: [auth, dogController.register] },
      { method: 'post', path: '/upload', middlewares: [auth, multer().single('file0'), dogController.uploadDogImage] },
      { method: 'get', path: '/list', middlewares: [auth, dogController.dogList] },
      { method: 'get', path: '/showimage/:id?', middlewares: [dogController.showImage] },
    ];

    routes.forEach(route => {
      const stack = dogRouter.stack.find(layer => layer.route && layer.route.path === route.path);
      expect(stack).toBeTruthy();
      expect(stack.route.stack[0].method).toBe(route.method);
      expect(stack.route.stack.map(m => m.name)).toEqual(route.middlewares.map(m => m.name));
    });
  });
});

import request from 'supertest';
import express from 'express';
import * as dogController from '../controllers/dogController';
import dogModel from '../models/Dog';
import validate from '../helpers/validate';
import multer from 'multer';

const app = express();
app.use(express.json());

// Mock del middleware de autenticación
const mockAuth = (req, res, next) => {
    req.user = { id: 'mockUserId' };
    next();
};

// Mock de multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/register', mockAuth, dogController.register);
app.post('/uploadDogImage', [mockAuth, upload.single('file')], dogController.uploadDogImage);
app.get('/dogs', mockAuth, dogController.dogList);
app.get('/showImage/:id', dogController.showImage);

describe('Dog Controller', () => {

    // Mockear el modelo y las funciones de validación
    beforeEach(() => {
        jest.spyOn(dogModel, 'findOne').mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(null),
        }));
        jest.spyOn(dogModel, 'create').mockImplementation(() => ({
            then: jest.fn().mockResolvedValue({ _id: 'mockDogId', name: 'mockDog' }),
            catch: jest.fn().mockRejectedValue(new Error('mock error')),
        }));
        jest.spyOn(validate, 'Dog').mockImplementation(() => true);
        jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should register a new dog', async () => {
        const res = await request(app)
            .post('/register')
            .send({ name: 'Fido' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Perro registrado con exito');
        expect(res.body.dog).toEqual({ _id: 'mockDogId', name: 'mockDog' });
    });

    it('should fail to register a dog if validation fails', async () => {
        jest.spyOn(validate, 'Dog').mockImplementation(() => false);

        const res = await request(app)
            .post('/register')
            .send({ name: 'Fido' });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('Error');
        expect(res.body.message).toBe('Faltan campos por enviar o hay errores de tipo en alguno de ellos');
    });

    it('should upload a dog image', async () => {
        jest.spyOn(dogModel, 'findOne').mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue({ _id: 'mockDogId', image: 'default_image.jpg' }),
        }));
        jest.spyOn(dogModel, 'findByIdAndUpdate').mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue({ _id: 'mockDogId', image: 'new_image.jpg' }),
        }));

        const res = await request(app)
            .post('/uploadDogImage')
            .field('name', 'Fido')
            .attach('file', Buffer.from('mock file content'), 'test.jpg');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Imagen subida con exito');
        expect(res.body.dog).toEqual({ _id: 'mockDogId', image: 'new_image.jpg' });
    });

    it('should list all dogs for a user', async () => {
        jest.spyOn(dogModel, 'find').mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue([{ _id: 'mockDogId', name: 'Fido' }]),
        }));

        const res = await request(app).get('/dogs');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('Success');
        expect(res.body.message).toBe('Lista de perros del usuario');
        expect(res.body.dogs).toEqual([{ _id: 'mockDogId', name: 'Fido' }]);
    });

    it('should show an image of a dog', async () => {
        jest.spyOn(dogModel, 'findById').mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue({ _id: 'mockDogId', image: 'mock_image.jpg' }),
        }));
        jest.spyOn(fs, 'stat').mockImplementation((path, callback) => {
            callback(null, true);
        });
        jest.spyOn(path, 'resolve').mockImplementation((p) => p);

        const res = await request(app).get('/showImage/mockDogId');

        expect(res.status).toBe(200);
    });
});

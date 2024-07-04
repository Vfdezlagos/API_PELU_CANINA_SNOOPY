import request from 'supertest';
import express from 'express';
import userRouter from '../routes/userRouter';
import * as userController from '../controllers/userController';
import authMailer from '../middlewares/authMailer';
import auth from '../middlewares/auth';

const app = express();
app.use(express.json());
app.use('/api/users', userRouter);

jest.mock('../controllers/userController');
jest.mock('../middlewares/authMailer');
jest.mock('../middlewares/auth');

describe('User Router', () => {
  test('GET /api/users/test should call userController.test', async () => {
    userController.test.mockImplementation((req, res) => res.status(200).send('OK'));
    const res = await request(app).get('/api/users/test');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
    expect(userController.test).toHaveBeenCalled();
  });

  test('POST /api/users/register should call userController.register', async () => {
    userController.register.mockImplementation((req, res) => res.status(201).send('User registered'));
    const res = await request(app).post('/api/users/register').send({ username: 'testuser', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.text).toBe('User registered');
    expect(userController.register).toHaveBeenCalled();
  });

  test('GET /api/users/validateUserRegister/:token should call authMailer and userController.validateRegister', async () => {
    authMailer.mockImplementation((req, res, next) => next());
    userController.validateRegister.mockImplementation((req, res) => res.status(200).send('User validated'));
    const res = await request(app).get('/api/users/validateUserRegister/testtoken');
    expect(res.status).toBe(200);
    expect(res.text).toBe('User validated');
    expect(authMailer).toHaveBeenCalled();
    expect(userController.validateRegister).toHaveBeenCalled();
  });

  test('POST /api/users/login should call userController.login', async () => {
    userController.login.mockImplementation((req, res) => res.status(200).send('Login successful'));
    const res = await request(app).post('/api/users/login').send({ username: 'testuser', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('Login successful');
    expect(userController.login).toHaveBeenCalled();
  });
});

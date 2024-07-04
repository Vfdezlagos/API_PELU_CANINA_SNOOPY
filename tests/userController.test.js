import { register } from "../controllers/userController";
import userModel from "../models/User";
import validate from "../helpers/validate";
import bcrypt from "bcrypt";
import * as jwt from "../helpers/jwt";
import sendEmail from "../helpers/mailer";
import * as encripter from "../helpers/encripter";
import config from "../config";

// Mock dependencies
jest.mock("../models/User");
jest.mock("../helpers/validate");
jest.mock("bcrypt");
jest.mock("../helpers/jwt");
jest.mock("../helpers/mailer");
jest.mock("../helpers/encripter");
jest.mock("../config");

describe("User registration", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        username: "testuser",
        password: "password123"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    validate.User.mockReturnValue(true);
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });
    bcrypt.hash.mockResolvedValue("hashedpassword");
    jwt.createRegisterToken.mockReturnValue("mockToken");
    encripter.encriptar.mockReturnValue("encryptedToken");
    sendEmail.mockResolvedValue("Email sent");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if body data is invalid", async () => {
    validate.User.mockReturnValue(false);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: "Error",
      message: "Faltan datos por enviar",
      bodyData: req.body
    });
  });

  test("should return 400 if user already exists", async () => {
    userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ email: "test@example.com" })
    });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      status: "Error",
      message: "El usuario ya existe"
    });
  });

  test("should return 500 if bcrypt hashing fails", async () => {
    bcrypt.hash.mockRejectedValue(new Error("Hashing error"));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: "Error",
      message: "Error al intentar encriptar la contraseña"
    });
  });

  test("should return 500 if email sending fails", async () => {
    sendEmail.mockRejectedValue(new Error("Email error"));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      status: "Error",
      message: "No se pudo enviar el Email"
    });
  });

  test("should register user successfully and send email", async () => {
    await register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
    expect(jwt.createRegisterToken).toHaveBeenCalledWith(expect.objectContaining({
      email: req.body.email,
      username: req.body.username,
      password: "hashedpassword"
    }));
    expect(encripter.encriptar).toHaveBeenCalledWith("mockToken");
    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      status: "Success",
      message: "Email de Registro de usuario enviado con exito",
      response: "Email sent"
    });
  });
});

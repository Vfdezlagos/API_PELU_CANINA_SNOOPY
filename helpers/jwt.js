import jwt from 'jwt-simple';
import moment from 'moment';
import config from "../config.js";

// llave secreta
const secret = config.JWT_KEY;

// Crear funcion para generar tokens
const createToken = (user) => {

    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(15, "days").unix()
    };

    // Devolver el token
    return jwt.encode(payload, secret);
}

// Crear funcion para generar tokens para enviar por emails
const createMailerToken = (user) => {

    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(1, "days").unix()
    };

    // Devolver el token
    return jwt.encode(payload, secret);
}

// Crear funcion generar token para confirmacion de registro de usuario
const createRegisterToken = (user) => {

    const payload = {
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        subscribed: user.subscribed,
        iat: moment().unix(),
        exp: moment().add(2, "hours").unix()
    };

    // Devolver el token
    return jwt.encode(payload, secret);
}

// Exportar modulo
export {
    secret,
    createToken,
    createMailerToken,
    createRegisterToken
}
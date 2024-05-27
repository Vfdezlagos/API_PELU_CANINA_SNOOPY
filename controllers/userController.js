import userModel from "../models/User.js";
import * as jwt from "../helpers/jwt.js";
import sendEmail from "../helpers/mailer.js";
import validate from "../helpers/validate.js";
import bcrypt from "bcrypt";

const test = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'ruta de prueba para controlador de usuarios'
    });
}



const register = (req, res) => {
    // obtener datos del body
    const bodyData = req.body;

    // validar datos del body
    if(!validate.User(bodyData)) return res.status(400).send({
        status: 'Error',
        message: 'Faltan datos por enviar',
        bodyData
    });

    // verificar si el usuario ya existe en la base de datos
    userModel.findOne({$or: [{email: bodyData.email}, {username: bodyData.username}]}).exec()
    .then(async existingUser => {
        if(existingUser) {
            return res.status(400).send({
                status: 'Error',
                message: 'El usuario ya existe'
            });
        }

        // encriptar password
        try {
            const encriptedPassword = await bcrypt.hash(bodyData.password, 10);

            // crear usuario para guardar en db
            const createdUser = {...bodyData};
            createdUser.password = encriptedPassword;

            console.log(createdUser);
        
            // crear token con los datos del body
            const token = jwt.createRegisterToken(createdUser);

            // preparar mail
            const html = `<head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        </head>
        <body>
            <div class="container my-5">
                <div class="p-5 text-center bg-body-tertiary rounded-3">
                  <img src="./public/images/logo final 1920x1920.webp" alt="logo peluqueria canina snoopy" width="20%">
                  <h1 class="text-body-emphasis">Validación de Registro</h1>
                  <p class="col-lg-8 mx-auto fs-5 text-muted">
                    Bienvenido a Peluqueria canina Snoopy, presione sobre el siguiente enlace para completar su registro.
                  </p>
                  <div class="d-inline-flex gap-2 mb-5">
                    <button class="d-inline-flex align-items-center btn btn-primary btn-lg px-4 rounded-pill" type="button">
                        <a class="mx-3" style="text-decoration: none; color: white;" href="https://api-pelu-canina-snoopy.onrender.com/api/user/validateUserRegister/${token}">Validar registro aquí</a>
                        <svg width="26px" height="26px" stroke-width="2.4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#00eeff"><path d="M7 12.5L10 15.5L17 8.5" stroke="#00eeff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#00eeff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
        
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" type="text/javascript"></script>
        </body>`

            const options = {
                to: bodyData.email,
                subject: 'Validación de Registro de usuario',
                html
            }

            // enviar mail
            sendEmail(options)
                .then(response => {
                    return res.status(200).send({
                        status: 'Success',
                        message: 'Email enviado con exito',
                        response
                    })
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'No se pudo enviar el Email'
                    });
                });
        } catch (error) {

            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar encriptar la contraseña'
            });
            
        }
        
    })
    .catch(error => {
        return res.status(500).send({
            status: 'Error',
            message: 'Error al verificar la existencia del usuario en DB'
        });
    });
}

const validateRegister = async (req, res) => {

    // obtener datos del usuario por la req
    const user = req.user;

    // verificar si el usuario existe
    await userModel.findOne({$or: [{email: user.email}, {username: user.username}]}).exec()
        .then(existingUser => {
            if(existingUser) {
                return res.status(400).send({
                    status: 'Error',
                    message: 'El usuario ya existe'
                });
            }

            // hacer un create en DB
            userModel.create(user)
            .then(createdUser => {
                if(!createdUser || createdUser.length == 0) return res.status(400).send({
                    status: 'Error',
                    message: 'No se pudo crear el usuario'
                });

                return res.status(200).send({
                    status: 'Success',
                    message: 'Usuario creado con exito',
                    user: createdUser
                });
            })
            .catch(error => {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al intentar crear al usuario'
                });
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al verificar la existencia del usuario en DB'
            });
        });
}

const login = (req, res) => {

    // obtener datos del body
    const bodyData = req.body;

    // verificar que llega username y password
    if(!bodyData.username || !bodyData.password || bodyData.username.length == 0 || bodyData.password.length == 0) return res.status(400).send({
        status: 'Error',
        message:'Faltan datos por mandar'
    });

    // hacer un findOne
    userModel.findOne({$or: [{email: bodyData.username}, {username: bodyData.username}]}).exec()
        .then( user => {
            if(!user || user.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'Usuario no encontrado'
            });

            // verificar que la contraseña coincida con la del usuario
            const checkPassword = bcrypt.compareSync(bodyData.password, user.password);

            if(!checkPassword) return res.status(400).send({
                status: 'Error',
                message: 'La contraseña es incorrecta'
            });

            // crear objeto user para guardar en el token
            const identifiedUser = user.toObject();

            // eliminar la info que no queremos guardar en el token
            delete identifiedUser.password;
            delete identifiedUser.__v;
            delete identifiedUser._id;
            delete identifiedUser.created_at;

            // crear token con el usuario encontrado
            const token = jwt.createToken(identifiedUser);

            // devolver respuesta
            return res.status(200).send({
                status: 'Success',
                message: 'Usuario identificado correctamente',
                user: identifiedUser,
                token
            });

        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al verificar la existencia del usuario en la DB'
            });
        });
}



export {
    test,
    register,
    validateRegister,
    login
}
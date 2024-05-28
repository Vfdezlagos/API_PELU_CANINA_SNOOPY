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
        
            // crear token con los datos del body
            const token = jwt.createRegisterToken(createdUser);

            // preparar mail
            const html = `<div style="display: block; margin: 0 auto; width: 100%; min-height: 600px; background-color: white; color: black; background-image: url(cid:patron_patitas); background-repeat: repeat;">
                            <div style="display: block; margin: 0 auto; width: 50%; min-height: 600px; background-color: #F6F8FC;">
                                <img style="display: block; width: 10em; margin: 0 auto; padding-top: 50px;" src="cid:logo_pelu_canina" alt="logo peluquería canina snoopy">
                                <h1 style="text-align: center; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 2em; color: black;">Validación de registro de usuario</h1>
                                <br />
                                <br />
                                <h2 style="text-align: center; padding-left: 20px; padding-right: 20px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 1.3em; color: black;">Presiona sobre el botón "Completar mi registro" para validar tu cuenta de usuario en Peluqueria canina Snoopy!</h2>
                                <br />
                                <div style="text-align: center;">
                                    <a href="https://api-pelu-canina-snoopy.onrender.com/api/user/validateUserRegister/${token}"><button style="font-family:Verdana, Geneva, Tahoma, sans-serif; font-size: 1.2em; background-color: rgb(0, 183, 255); width: fit-content; height: 50px; line-height: 40px; border: 2px solid rgb(0, 183, 255); border-radius: 40px; color: white; margin-bottom: 1.5em;">Completar mi registro</button></a>
                                </div>
                                <p style="text-align: center; padding-bottom: 40px; font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color: black;">El enlace estará disponible durante 2 horas. Luego tendrás que volver a registrarte.</p>
                            </div>
                        </div>`

            const options = {
                to: bodyData.email,
                subject: 'Validación de Registro de usuario',
                html,
                attachments: [{
                        filename: 'logo_480x480.png',
                        path: 'public/images/logo_480x480.png',
                        cid: 'logo_pelu_canina'
                    },
                    {
                        filename: 'patron_patitas.png',
                        path: 'public/images/patron_patitas.png',
                        cid: 'patron_patitas'
                    }
                ]
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

            
            // crear token con el usuario encontrado
            const token = jwt.createToken(identifiedUser);

            // eliminar la info que no queremos guardar en el token
            delete identifiedUser.password;
            delete identifiedUser.__v;
            delete identifiedUser._id;
            delete identifiedUser.created_at;


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
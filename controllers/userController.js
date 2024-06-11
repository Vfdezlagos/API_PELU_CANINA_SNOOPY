import userModel from "../models/User.js";
import dogModel from "../models/Dog.js";
import * as userHelper from "../helpers/userHelper.js";
import * as jwt from "../helpers/jwt.js";
import sendEmail from "../helpers/mailer.js";
import validate from "../helpers/validate.js";
import bcrypt from "bcrypt";
import fs from "node:fs";
import config from "../config.js";

const test = async (req, res) => {
    const response = await userHelper.getUserDogsImages('6668d57c69d90c75e1995339');
    const dogImageNames = response.map(dog => dog.image);


    return res.status(200).send({
        status: 'Success',
        message: 'ruta de prueba para controlador de usuarios',
        dogImageNames
    });
}


// Registro de usuario
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

            // const url objetivo
            const url = `${config.FRONTEND_HOST}/completar_registro/${token}`

            // preparar mail
            const html = `<div style="display: block; margin: 0 auto; width: 100%; min-height: 600px; background-color: white; color: black; background-image: url(cid:patron_patitas); background-repeat: repeat;">
                            <div style="display: block; margin: 0 auto; width: 50%; min-height: 600px; background-color: #F6F8FC;">
                                <img style="display: block; width: 10em; margin: 0 auto; padding-top: 50px;" src="cid:check_icon" alt="check icon blue">
                                <h1 style="text-align: center; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 2em; color: black;">Validación de registro de usuario</h1>
                                <br />
                                <br />
                                <h2 style="text-align: center; padding-left: 20px; padding-right: 20px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 1.3em; color: black;">Presiona sobre el botón "Completar mi registro" para validar tu cuenta de usuario en Peluqueria canina Snoopy!</h2>
                                <br />
                                <div style="text-align: center;">
                                    <a href="${url}"><button style="font-family:Verdana, Geneva, Tahoma, sans-serif; font-size: 1.2em; background-color: rgb(0, 183, 255); width: fit-content; height: 50px; line-height: 40px; border: 2px solid rgb(0, 183, 255); border-radius: 40px; color: white; margin-bottom: 1.5em;">Completar mi registro</button></a>
                                </div>
                                <p style="text-align: center; padding-bottom: 40px; font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color: black;">El enlace estará disponible durante 2 horas. Luego tendrás que volver a registrarte.</p>
                            </div>
                        </div>`

            const options = {
                to: bodyData.email,
                subject: 'Validación de Registro de usuario',
                html,
                attachments: [{
                        filename: 'check_icon_480x480.png',
                        path: 'public/images/check_icon_480x480.png',
                        cid: 'check_icon'
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
                        message: 'Email de Registro de usuario enviado con exito',
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


// Login y Password Recovery
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

const passwordChange = (req, res) => {
    // obtener datos del body
    const bodyData = req.body;

    // validar que llega email o username
    if((!bodyData.username || (bodyData.username && bodyData.username.length == 0)) && (!bodyData.email || (bodyData.email && bodyData.email.length == 0))) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el email o username del usuario'
    });

    // hacer un findOne
    userModel.findOne({$or: [{username: bodyData.username}, {email: bodyData.email}]}).exec()
        .then(user => {

            if(!user || user.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'Usuario no encontrado'
            });

            // crear token de recuperación de contraseña
            const token = jwt.createMailerToken(user);

            // crear url destino
            const url = `${config.FRONTEND_HOST}/password-change/${token}`  

            // configurar email
            const html = `<div style="display: block; margin: 0 auto; width: 100%; min-height: 600px; background-color: white; color: black; background-image: url(cid:patron_patitas); background-repeat: repeat;">
                            <div style="display: block; margin: 0 auto; width: 50%; min-height: 600px; background-color: #F6F8FC;">
                                <img style="display: block; width: 10em; margin: 0 auto; padding-top: 50px;" src="cid:lock_icon" alt="check icon blue">
                                <h1 style="text-align: center; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 2em; color: black;">Solicitud de cambio de contraseña</h1>
                                <br />
                                <br />
                                <h2 style="text-align: center; padding-left: 20px; padding-right: 20px; font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; font-size: 1.3em; color: black;">Presiona sobre el botón "Cambiar contraseña" para dirigirte al formulario de cambio de contraseña en Peluqueria canina Snoopy!</h2>
                                <br />
                                <div style="text-align: center;">
                                    <a href="${url}"><button style="font-family:Verdana, Geneva, Tahoma, sans-serif; font-size: 1.2em; background-color: #059669; width: fit-content; height: 50px; line-height: 40px; border: 2px solid #007A54; border-radius: 40px; color: white; margin-bottom: 1.5em;">Cambiar contraseña</button></a>
                                </div>
                                <p style="text-align: center; padding-bottom: 40px; font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif; color: black;">El enlace estará disponible durante 2 horas. Luego tendrás que volver a solicitar el enlace.</p>
                            </div>
                        </div>`
            
            const options = {
                to: user.email,
                subject: 'Solicitud de cambio de contraseña',
                html,
                attachments: [
                    {
                        filename: 'lock_icon_480x480.png',
                        path: 'public/images/lock_icon_480x480.png',
                        cid: 'lock_icon'
                    },
                    {
                        filename: 'patron_patitas.png',
                        path: 'public/images/patron_patitas.png',
                        cid: 'patron_patitas'
                    }
                ]
            }

            // mandar email

            sendEmail(options)
                .then(response => {
                    return res.status(200).send({
                        status: 'Success',
                        message: 'Email de Cambio de contraseña enviado con exito',
                        response
                    })
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'No se pudo enviar el Email'
                    });
                });
            
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar al usuario en DB'
            });
        });

}

const passwordReset = async (req, res) => {   

    // Obtener id del usuario identificado
    const userId = req.user.id;

    // obtener datos del body
    const bodyData = req.body;

    // verificar que llega password y password_verification
    if((!bodyData.password || !bodyData.password_verification || bodyData.password.length == 0 || bodyData.password_verification.length == 0)) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar los campos password y password_verification'
    });

    // verificar que ambas password sean iguales
    if(bodyData.password !== bodyData.password_verification) return res.status(400).send({
        status: 'Error',
        message: 'Las contraseñas no coinciden'
    });

    // guardar nueva pass en una variable
    const newPass = bodyData.password;

    // encriptar nueva contraseña contraseña
    try {
        const encriptedPass = await bcrypt.hash(newPass, 10);

        // hacer un findByIdAndUpdate
        userModel.findByIdAndUpdate(userId, {password: encriptedPass}, {new: true}).exec()
            .then(updatedUser => {
                if(!updatedUser || updatedUser.length == 0) return res.status(404).send({
                    status: 'Error',
                    message: 'Usuario no encontrado'
                });

                return res.status(200).send({
                    status: 'Success',
                    message: 'Contraseña actualizada con exito',
                    new_password: newPass,
                    user: updatedUser
                });
            })
            .catch(error => {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al buscar al usuario en DB'
                });
            });

    } catch (error) {
        console.log('Error al intentar encriptar la contraseña');
        return res.status(500).send({
            status: 'Error',
            message: 'Error al intentar encriptar la contraseña'
        });
    }
    
    
    
}


// Listar usuarios (solo puede acceder el admin)
const list = (req, res) => {
    // obtener usuario identificado
    const user = req.user;
    const role = user.role;

    // verificar que sea admin
    if(!role || role !== 'role-admin') return res.status(401).send({
        status: 'Error',
        message: 'Debe ser administrador para realizar esta acción'
    });

    userModel.find().exec()
        .then(users => {
            if(!users || users.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontraron usuarios'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Lista de usuarios',
                users
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al buscar usuarios en DB'
            });
        });
}

const findById = (req, res) => {

    // obtener usuario identificado
    const user = req.user;
    const role = user.role;

    // verificar que sea admin
    if(!role || role !== 'role-admin') return res.status(401).send({
        status: 'Error',
        message: 'Debe ser administrador para realizar esta acción'
    });

    // obtener id por url
    const userId = req.params.id;

    if(!userId || userId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del usuario por parametro de la url'
    });

    // hacer un findById
    userModel.findById(userId).exec()
        .then(user => {
            if(!user || user.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró al usuario'
            });

            return res.status(200).send({
                status:'Success',
                message: 'Usuario encontrado',
                user
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al buscar al usuario en DB'
            });
        });
}


// Actualizar usuario
const update = (req, res) => {
    // obtener id por parametro
    const userId = req.params.id;

    if(!userId || userId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del usuario por parametro de la url'
    });

    // obtener datos del body
    const bodyData = req.body;

    // hacer un findByIdAndUpdate
    userModel.findByIdAndUpdate(userId, bodyData, {new: true}).exec()
        .then(updatedUser => {
            if(!updatedUser || updatedUser.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró al usuario a actualizar'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Usuario actualizado con exito',
                user: updatedUser
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar al usuario en DB'
            });
        });
}


// Eliminar usuario
const deleteUser = (req, res) => {
    // obtener id por parametro
    const userId = req.params.id;

    if(!userId || userId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del usuario por parametro de la url'
    });

    // hacer un findByIdAndDelete
    userModel.findByIdAndDelete(userId).exec()
        .then(async deletedUser => {
            if(!deletedUser || deletedUser.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró al usuario a eliminar o ya fue eliminado anteriormente'
            });

            // hacer que se eliminen los perros registrados del usuario
            try {
                
                // traer los nombres de las imagenes de los perros
                const response = await userHelper.getUserDogsImages(userId);
                const dogImageNames = response.map(dog => dog.image);
                
                // eliminar perros de DB
                const dogsDeletedCounter = await dogModel.deleteMany({user: userId}).exec();

                // borrar imagenes de los perros del usuario
                dogImageNames.forEach(image => {
                    if(image !== 'default_image.png'){
                        let imagePath = "public/images/uploads/dogs/" + image;
                        fs.unlinkSync(imagePath);
                    }
                });

                // devolver respuesta
                return res.status(200).send({
                    status: 'Success',
                    message: 'Usuario y sus perros eliminados exitosamente',
                    user: deletedUser,
                    dogs_quantity: dogsDeletedCounter
                });
            } catch (error) {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al intentar eliminar los perros del usuario'
                });
            }
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al buscar al usuario en DB'
            });
        });
}


export {
    test,
    register,
    validateRegister,
    login,
    passwordChange,
    passwordReset,
    list,
    findById,
    update,
    deleteUser
}
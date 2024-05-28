import mongoose from "mongoose";
import dogModel from "../models/Dog.js";
import validate from "../helpers/validate.js";

const test = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Ruta de prueba de dogController'
    });
}


const register = (req, res) => {
    // obtener id del usuario identificado
    const userId = req.user.id;

    // obtener datos del body
    const bodyData = req.body;

    // validar datos del body
    if(!validate.Dog(bodyData)) return res.status(400).send({
        status: 'Error',
        message: 'Faltan campos por enviar o hay errores de tipo en alguno de ellos'
    });

    // ver si el perro existe con el id (del dueño) y nombre del perro
    dogModel.findOne({user: userId, name: bodyData.name}).exec()
        .then(dogExists => {
            if(dogExists) return res.status(400).send({
                status: 'Error',
                message: 'El perro ya existe'
            });

            // crear objeto Dog a guardar
            const dog = {user: userId, ...bodyData};

            // hacer un create
            dogModel.create(dog)
                .then(createdDog => {
                    if(!createdDog || createdDog.length == 0) return res.status(400).send({
                        status: 'Error',
                        message: 'No se crear registro del perro en DB'
                    });

                    return res.status(200).send({
                        status: 'Success',
                        message: 'Perro registrado con exito',
                        dog: createdDog
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar registrar al perro en DB'
                    });
                });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar verificar la existencia del perro'
            });
        });
}


export {
    test,
    register
}
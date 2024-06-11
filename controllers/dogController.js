import dogModel from "../models/Dog.js";
import validate from "../helpers/validate.js";
import fs from "node:fs";
import path from "node:path";

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

const uploadDogImage = (req, res) => {

    // Obtener userId
    const userId = req.user.id;

    // Obtener nombre del perro por body
    const bodyData = req.body;

    const dogName = bodyData.name;

    // verificar que llega el campo file
    if(!req.file) return res.status(400).send({
        status: 'Error',
        message: 'Debe subir una imagen al campo file',
    });
    
    const file = req.file;

    // Obtener filename
    const fileOriginalName = file.originalname;

    // Obtener extension del archivo
    const splitImageName = fileOriginalName.split('\.');
    const extension = splitImageName[splitImageName.length - 1].toLowerCase();

    console.log(file);

    // Comprobar extension, si no es correcta eliminar archivo del directorio
    if(!validate.imageExtension(extension)){

        // eliminar archivo del directorio
        const filePath = req.file.path;
        fs.unlinkSync(filePath);

        // Devolver error
        return res.status(400).send({
            status: 'Error',
            message: 'La extension del archivo es invalida, debe ser png, jpg, jpeg o gif',
        });
    }


    // Hacer un findOne
    dogModel.findOne({user: userId, name: dogName}).exec()
        .then(dog => {

            if(!dog || dog.length == 0){
                // eliminar archivo del directorio
                const filePath = req.file.path;
                fs.unlinkSync(filePath);

                return res.status(404).send({
                    status: 'Error',
                    message: 'No se encontró el registro del perro'
                });
            }

            // ver si la imagen asociada al perro no es default
            if(dog.image !== 'default_image.jpg') {
                console.log('..\\' + dog.image);
                try {
                    // Si no es default eliminar imagen del storage
                    const oldImagePath = dog.image;
                    fs.unlinkSync(oldImagePath);
                } catch (error) {
                    console.log('no se pudo borrar la imagen en el storage');
                }
            }

            // actualizar campo image en el perro seleccionado
            dogModel.findByIdAndUpdate(dog._id, {image: req.file.filename}, {new:true}).exec()
                .then(updatedDog => {
                    if(!updatedDog || updatedDog.length == 0 ) {
                        // eliminar archivo del directorio
                        const filePath = req.file.path;
                        fs.unlinkSync(filePath);

                        return res.status(404).send({
                            status: 'Error',
                            message: 'No se encontró el perro a actualizar'
                        });
                    }

                    return res.status(200).send({
                        status: 'Success',
                        message: 'Imagen subida con exito',
                        dog: updatedDog
                    });
                })
                .catch(error => {

                    // eliminar archivo del directorio
                    const filePath = req.file.path;
                    fs.unlinkSync(filePath);

                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar al perro'
                    });
                });

        })
        .catch(error => {
            // eliminar archivo del directorio
            const filePath = req.file.path;
            fs.unlinkSync(filePath);

            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar al perro en DB'
            });
        });

}

const dogList = (req, res) => {
    // Obtener userId del usuario identificado
    const userId = req.user.id;

    // hacer un find
    dogModel.find({user: userId}).exec()
        .then(dogs => {
            if(!dogs || dogs.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontraron perros de este usuario'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Lista de perros del usuario',
                dogs
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al hacer la busqueda de lso perros'
            });
        });

}

const showImage = (req, res) => {

    if(!req.params.id) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar el id del perro como parametro por la url'
    });

    // obtener id del perro por parametro
    const dogId = req.params.id;

    // hacer un find
    dogModel.findById(dogId).exec()
        .then(dog => {
            if(!dog || dog.length == 0) return res.status(404).send({
                status: 'Error',
                message:'dog no encontrado'
            });

            // montar el path completo de la imagen
            const fileName = dog.image;
            const filePath = "public/images/uploads/dogs/" + fileName;

            // Comprobar que existe el fichero
            fs.stat(filePath, (error, exists) => {
                if (error || !exists) return res.status(404).send({
                    status: 'Error',
                    message: 'El archivo no existe',
                    error
                });

                // devolver el fichero
                return res.sendFile(path.resolve(filePath));
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al hacer la busqueda del perro en DB'
            });
        });    
}

export {
    test,
    register,
    uploadDogImage,
    dogList,
    showImage
}
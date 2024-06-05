import validate from "../helpers/validate.js";
import postModel from "../models/Post.js";
import fs from 'node:fs';
import path from "node:path";


const test = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message: 'Ruta de prueba de post controller'
    });
}

const register = (req, res) => {
    // Obtener role del usuario identificado
    const role = req.user.role;

    // si no es admin devolver error
    if(role !== 'role-admin'){

        // Eliminar archivos subidos
        if(req.files[0]){
            const image1Path = req.files[0].path;
            fs.unlinkSync(image1Path);
        }

        if(req.files[1]){
            const image2Path = req.files[1].path;
            fs.unlinkSync(image2Path);
        }

        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    } 


    // obtener datos del body
    const bodyData = req.body;
    const files = req.files;

    

    // verificar datos del body
    if(!validate.Post(bodyData)){

        // Eliminar archivos subidos
        if(files[0]){
            const image1Path = files[0].path;
            fs.unlinkSync(image1Path);
        }

        if(files[1]){
            const image2Path = files[1].path;
            fs.unlinkSync(image2Path);
        }


        return res.status(400).send({
            status: 'Error',
            message: 'Faltan campos por mandar o hay algun dato que no es valido (revisar consola)'
        });
    }

    // crear objeto post a guardar en DB
    const images = {
        image1: files[1].filename,
        image2: files[0].filename
    }
    const post = {...bodyData, ...images}

    console.log(post);

    // hacer un create
    postModel.create(post)
        .then(post => {
            if(!post || post.length == 0) return res.status(400).send({
                status: 'Error',
                message: 'No se pudo crear el post'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Post creado con exito',
                post
            });
        })
        .catch(error => {

            // Eliminar archivos subidos
            if(req.files[0]){
                const image1Path = req.files[0].path;
                fs.unlinkSync(image1Path);
            }

            if(req.files[1]){
                const image2Path = req.files[1].path;
                fs.unlinkSync(image2Path);
        }

            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar registrar el post en DB'
            });
        });
}

const showImage = (req, res) => {

    if(!req.params.id) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar el id del post como parametro por la url'
    });

    // obtener id del post por parametro
    const postId = req.params.id;

    // obtener numero de imagen por post
    const imageNumber = req.params.number ? req.params.number : 1;

    // hacer un find
    postModel.findById(postId).exec()
        .then(post => {
            if(!post || post.length == 0) return res.status(404).send({
                status: 'Error',
                message:'Post no encontrado'
            });

            // montar el path completo de la imagen
            const fileName = imageNumber == 1 ? post.image1 : post.image2;
            const filePath = "public/images/uploads/posts/" + fileName;

            // Comprbar que existe el fichero
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
                message: 'Error al hacer la busqueda del post en DB'
            });
        });    
}

export {
    test,
    register,
    showImage
}
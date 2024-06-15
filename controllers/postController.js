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


// Registro de post
const register = (req, res) => {
    // Obtener role del usuario identificado
    const role = req.user.role;

    // si no es admin devolver error
    if(role !== 'role-admin'){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    } 


    // obtener datos del body
    const bodyData = req.body;

    

    // verificar datos del body
    if(!validate.Post(bodyData)){
        return res.status(400).send({
            status: 'Error',
            message: 'Faltan campos por mandar o hay algun dato que no es valido (revisar consola)'
        });
    }

    // crear objeto post a guardar en DB
    const post = {...bodyData}


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
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar registrar el post en DB'
            });
        });
}


// Listado de posts y mostrar imagen
const listPaginate = (req, res) => {
    // Obtener page por url
    const page = req.params.page ? req.params.page : 1;

    // configurar paginate
    const custom_labels = {
        docs: 'posts',
        totalDocs: 'totalPosts',
    }

    const options = {
        select: '-__v -active',
        sort: {created_at: -1},
        page,
        limit: 10,
        customLabels: custom_labels
    }

    postModel.paginate({active: true}, options)
        .then(data => {
            if(!data || data.length == 0) return res.status(404).send({
                status: 'Not Found',
                message: 'No se encontraron publicaciones'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Lista de publicaciones',
                data
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al buscar publicaciones en DB'
            });
        })
}

const listPosts = (req, res) => {
    postModel.find({active: true}).select('-__v').sort({created_at: -1}).exec()
        .then(posts => {
            if(!posts || posts.length == 0) return res.status(404).send({
                status: 'Not Found',
                message: 'No se encontraron publicaciones'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Listado de publicaciones',
                posts
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar publicaciones en DB'
            });
        });
}

const findPostById = (req, res) => {
    // obtener id por parametro
    const postId = req.params.id;

    if(!postId || postId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar el id del post por url'
    });

    // hacer un findById
    postModel.findById(postId).exec()
        .then(post => {
            if(!post || post.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró el post'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Post encontrado',
                post
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buecar el post en DB'
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


// Eliminar post
const deletePostById = (req, res) => {
    // Obtener id del post por parametro
    const postId = req.params.id;

    // hacer un findByIdAndDelete
    postModel.findByIdAndDelete(postId)
        .then(deletedPost => {

            if(!deletedPost) return res.status(404).send({
                status: 'Error',
                message: 'El post no pudo ser encontrado o ya ha sido eliminado'
            });

            // Eliminar imágenes relacionadas al post
            if(deletedPost.image1 !== 'default_image.png'){
                const image1Path = "public/images/uploads/posts/" + deletedPost.image1;
                fs.unlinkSync(image1Path);
            }

            if(deletedPost.image2 !== 'default_image.png'){
                const image2Path = "public/images/uploads/posts/" + deletedPost.image2;
            fs.unlinkSync(image2Path);
            }

            return res.status(200).send({
                status: 'Success',
                message: 'Post eliminado exitosamente',
                post: deletedPost
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar eliminar el post en DB'
            });
        });
}

const changePostStatus = (req, res) => {
    // obtener id del post por url
    const postId = req.params.id;

    if(!postId || postId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar el id del post por url'
    });

    // hacer un findById
    postModel.findById(postId).exec()
        .then(post => {
            if(!post || post.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró el post'
            });

            let status = post.active == true ? false : true;

            postModel.findByIdAndUpdate(post._id, {active : status}, {new: true}).exec()
                .then(updatedPost => {
                    if(!updatedPost || updatedPost.length == 0) return res.status(404).send({
                        status: 'Error',
                        message: 'No se encontró el post al actualizar'
                    });

                    return res.status(200).send({
                        status: 'Success',
                        message: 'Post habilitado o inahibilitado con éxito',
                        post: updatedPost
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar el post'
                    });
                });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buecar el post en DB'
            });
        })
}


// actualizar post
const updatePost = (req, res) => {
    // obtener datos del body y id por parametro
    const bodyData = req.body;
    const postId = req.params.id;
    
    // hacer un findOneAndUpdate
    postModel.findOneAndUpdate({_id: postId}, bodyData, {new: true})
        .then(updatedPost => {
            if(!updatedPost) return res.status(404).send({
                status: 'Error',
                message: 'El post no pudo ser encontrado o actualizado'
            });
            return res.status(200).send({
                status: 'Success',
                message: 'Post actualizado exitosamente',
                updatedPost
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar actualizar el post en DB'
            });
        });
}

const updatePostImage1 = (req, res) => {
    // Obtener id del post por body
    const postId = req.body.id;

    // Obtener filename y path del archivo
    const filename = req.file.filename;
    const image1Path = req.file.path;

    // hacer un findById
    postModel.findById(postId).exec()
        .then(post => {

            if(!post || post.length == 0) {
                // si no encontró el post, borrar imagen subida y devolver error
                fs.unlinkSync(image1Path);

                return res.status(400).send({
                    status: 'Error',
                    message: 'No se encontró el post o este ya fue eliminado'
                });
            }

            // obtener valor de image1 del post encontrado
            const oldImage1 = post.image1;
            
            // hacer un findByIdAndUpdate
            postModel.findByIdAndUpdate(postId, {image1: filename}, {new: true})
                .then(updatedPost => {
                    if(!updatedPost) {
                        // si no se pudo actualizar el post, borrar imagen subida
                        fs.unlinkSync(image1Path);
                        return res.status(404).send({
                            status: 'Error',
                            message: 'El post no pudo ser encontrado o actualizado'
                        });
                    }
                    // si se pudo actualizar, borrar image1
                    if(oldImage1 !== 'default_image.png'){
                        const oldImage1Path = "public/images/uploads/posts/" + oldImage1;
                        fs.unlinkSync(oldImage1Path);
                    }
                    // devolver respuesta
                    return res.status(200).send({
                        status: 'Success',
                        message: 'Imagen1 del post actualizada exitosamente',
                        updatedPost
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar la imagen1 del post en DB'
                    });
                });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar el post en DB'
            });
        });
}

const updatePostImage2 = (req, res) => {
    // Obtener id del post por body
    const postId = req.body.id;

    // Obtener filename y path del archivo
    const filename = req.file.filename;
    const image2Path = req.file.path;

    // hacer un findById
    postModel.findById(postId).exec()
        .then(post => {

            if(!post || post.length == 0) {
                // si no encontró el post, borrar imagen subida y devolver error
                fs.unlinkSync(image2Path);

                return res.status(400).send({
                    status: 'Error',
                    message: 'No se encontró el post o este ya fue eliminado'
                });
            }

            // obtener valor de image1 del post encontrado
            const oldImage2 = post.image2;
            
            // hacer un findByIdAndUpdate
            postModel.findByIdAndUpdate(postId, {image2: filename}, {new: true})
                .then(updatedPost => {
                    if(!updatedPost) {
                        // si no se pudo actualizar el post, borrar imagen subida
                        fs.unlinkSync(image2Path);
                        return res.status(404).send({
                            status: 'Error',
                            message: 'El post no pudo ser encontrado o actualizado'
                        });
                    }
                    // si se pudo actualizar, borrar image1
                    if(oldImage2 !== 'default_image.png'){
                        const oldImage2Path = "public/images/uploads/posts/" + oldImage2;
                        fs.unlinkSync(oldImage2Path);
                    }
                    // devolver respuesta
                    return res.status(200).send({
                        status: 'Success',
                        message: 'Imagen2 del post actualizada exitosamente',
                        updatedPost
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar la imagen2 del post en DB'
                    });
                });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar el post en DB'
            });
        });
}

export {
    test,
    register,
    listPosts,
    listPaginate,
    findPostById,
    showImage,
    deletePostById,
    changePostStatus,
    updatePost,
    updatePostImage1,
    updatePostImage2,
}
import bannerModel from "../models/Banner.js";
import fs from 'node:fs';
import validate from "../helpers/validate.js";

const test = (req, res) => {
    return res.status(200).send({
        status: 'Success',
        message:'Test del controlador del banner'
    });
}


const register = (req, res) => {

    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // Obtener datos del body
    const bodyData = req.body;

    // verificar que llegue title como campo obligatorio
    if(!bodyData || !bodyData.title || bodyData.title.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el title como campo obligatorio'
    });

    // crear objeto a guardar
    const banner = {...bodyData};

    // hacer un create
    bannerModel.create(banner)
        .then(banner => {
            if(!banner || banner.length == 0) return res.status(400).send({
                status: 'Error',
                message: 'No se pudo guardar el banner el DB'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'banner creado con exito',
                banner
            });
        })
        .catch(error => {
            return res.status(500).send({
                status:'Error',
                message: 'Error al intentar guardar el banner en DB'
            });
        });

}

const update = (req, res) => {

    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // obtener id del banner por url
    const bannerId = req.params.id;

    if(!bannerId || bannerId.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del banner como parametro por la url'
    });

    // obtener datos del body
    const bodyData = req.body;

    // hacer un findByIdAndUpdate
    bannerModel.findByIdAndUpdate(bannerId, {...bodyData}, {new: true}).exec()
        .then(updatedBanner => {
            if(!updatedBanner) return res.status(404).send({
                    status: 'Error',
                    message: 'El banner no pudo ser encontrado o actualizado'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Banner actualizado con exito',
                updatedBanner
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar actualizar el banner'
            });
        });
}

const updateImage = (req, res) => {

    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // Obtener id del banner por body
    const bannerId = req.body.id;

    // Obtener filename y path del archivo
    const filename = req.file.filename;
    const imagePath = req.file.path;

    // hacer un findById
    bannerModel.findById(bannerId).exec()
        .then(banner => {

            if(!banner || banner.length == 0) {
                // si no encontró el banner, borrar imagen subida y devolver error
                fs.unlinkSync(imagePath);

                return res.status(400).send({
                    status: 'Error',
                    message: 'No se encontró el banner o este ya fue eliminado'
                });
            }

            // obtener valor de image del banner encontrado
            const oldImage = banner.image;
            
            // hacer un findByIdAndUpdate
            bannerModel.findByIdAndUpdate(bannerId, {image: filename, active: true}, {new: true})
                .then(updatedBanner => {
                    if(!updatedBanner) {
                        // si no se pudo actualizar el banner, borrar imagen subida
                        fs.unlinkSync(imagePath);
                        return res.status(404).send({
                            status: 'Error',
                            message: 'El banner no pudo ser encontrado o actualizado'
                        });
                    }
                    // si se pudo actualizar, borrar image
                    if(oldImage !== 'default_image.png'){
                        const oldImagePath = "public/images/uploads/banners/" + oldImage;
                        fs.unlinkSync(oldImagePath);
                    }
                    // devolver respuesta
                    return res.status(200).send({
                        status: 'Success',
                        message: 'Imagen1 del banner actualizada exitosamente',
                        updatedBanner
                    });
                })
                .catch(error => {

                    // Borrar imagen subida
                    fs.unlinkSync(imagePath);

                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar la imagen1 del banner en DB'
                    });
                });
        })
        .catch(error => {

            const imagePath = req.file.path;
            // Borrar imagen subida
            fs.unlinkSync(imagePath);

            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar el banner en DB'
            });
        });
}

const getBannerById = (req, res) => {

    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // verificar que llega el id por parametro
    if(!req.params.id || req.params.id.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del banner como parametro de la url'
    });

    //Obtener id del banner por parametro
    const bannerId = req.params.id;

    // Hacer un findById
    bannerModel.findById(bannerId).exec()
        .then(banner => {
            if(!banner || banner.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'banner no encontrado'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Banner encontrado',
                banner
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar el banner en DB'
            });
        });
}

const listBanners = (req, res) => {
    // Obtener page desde url
    const page = req.params.page ? req.params.page : 1;

    // configurar paginate
    const custom_labels = {
        docs: 'banners',
        totalDocs: 'totalBanners',
    }

    const options = {
        select: '-__v -active',
        sort: {created_at: -1},
        page,
        limit: 10,
        customLabels: custom_labels
    }

    bannerModel.paginate({active: true}, options)
        .then(banners => {
            if(!banners || banners.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontraron banners'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Lista de banners',
                banners
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar lso banners en DB'
            });
        });
}

const listDisabled = (req, res) => {

    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // Obtener page desde url
    const page = req.params.page ? req.params.page : 1;

    // configurar paginate
    const custom_labels = {
        docs: 'banners',
        totalDocs: 'totalBanners',
    }

    const options = {
        select: '-__v -active',
        sort: {created_at: -1},
        page,
        limit: 10,
        customLabels: custom_labels
    }

    bannerModel.paginate({active: false}, options)
        .then(banners => {
            if(!banners || banners.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontraron banners'
            });

            return res.status(200).send({
                status: 'Success',
                message: 'Lista de banners',
                banners
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar lso banners en DB'
            });
        });
}

const showImage = (req, res) => {

    if(!req.params.id) return res.status(400).send({
        status: 'Error',
        message: 'Debe enviar el id del banner como parametro por la url'
    });

    // obtener id del perro por parametro
    const bannerId = req.params.id;

    // hacer un find
    bannerModel.findById(bannerId).exec()
        .then(banner => {
            if(!banner || banner.length == 0) return res.status(404).send({
                status: 'Error',
                message:'banner no encontrado'
            });

            // montar el path completo de la imagen
            const fileName = banner.image;
            const filePath = "public/images/uploads/banners/" + fileName;

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

const changeStatus = (req, res) => {
    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // verificar que llega el id por url
    if(!req.params.id || req.params.id.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe mandar el id del banner como parametro por la url'
    });
    
    // Obtener id del banner por parametro de url
    const bannerId = req.params.id;

    // hacer un findById
    bannerModel.findById(bannerId).exec()
        .then(banner => {
            if(!banner || banner.length == 0) return res.status(404).send({
                status: 'Error',
                message: 'No se encontró el banner'
            });

            // obtener el valor de active
            const active = banner.active == true ? false : true;

            // hacer un findByIdAndUpdate
            bannerModel.findByIdAndUpdate(bannerId, {active}, {new: true}).exec()
                .then(updatedBanner => {
                    if(!updatedBanner || updatedBanner.length == 0) return res.status(404).send({
                        status: 'Error',
                        message: 'No se encontró el banner a actualizar'
                    });

                    return res.status(200).send({
                        status: 'Success',
                        message: 'Banner habilitado / Inhabilitado con exito',
                        banner: updatedBanner
                    });
                })
                .catch(error => {
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al intentar actualizar el banner en DB'
                    });
                });
        })
        .catch(error => {
            return res.status(500).send({
                status: 'Error',
                message: 'Error al intentar buscar el banner en DB'
            });
        });
}

const deleteBanner = (req, res) => {
    // Obtener role del usuario identificado
    const user = req.user;

    // si no es admin devolver error
    if(!validate.Admin(user)){
        return res.status(400).send({
            status: 'Error',
            message: 'Debes ser administrador para acceder a esta acción'
        });
    }

    // verificar que llega el id por url
    if(!req.params.id || req.params.id.length == 0) return res.status(400).send({
        status: 'Error',
        message: 'Debe indicar el id del banner por parametro en la url'
    });

    // Obtener id del banner por parametro de url
    const bannerId = req.params.id;

    // hacer un findByIdAndDelete
    bannerModel.findByIdAndDelete(bannerId).exec()
        .then(deletedBanner => {
            if(!deletedBanner || deletedBanner.length == 0) return res.status(404).send({
                status:'Error',
                message: 'no se encontró el banner a eliminar'
            });

            // Si se logra eliminar, borrar la imagen asociada (si no es default)
            if(deletedBanner.image !== 'default_image.png'){
                const filename = deletedBanner.image;
                const imagePath = `public/images/uploads/banners/${filename}`

                fs.unlinkSync(imagePath);
            }

            // devolver respuesta
            return res.status(200).send({
                status: 'Success',
                message: 'Banner eliminado con exito',
                banner: deletedBanner
            });
        })
        .catch(error => {
            return res.status(500).send({
                status:'Error',
                message: 'Error al intentar borrar el banner de la DB'
            });
        });
}



export {
    test,
    register,
    update,
    updateImage,
    listBanners,
    listDisabled,
    getBannerById,
    showImage,
    changeStatus,
    deleteBanner
}
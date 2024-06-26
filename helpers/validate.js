import validator from "validator";

const validateEmptyAlpha = (text) => {
    if(validator.isEmpty(text)){
        console.log('El campo esta vacio');
        return false;
    }

    if(!validator.isAlpha(text)){
        console.log('El campo debe contener solo letras a-z A-Z');
        return false;
    }

    return true;
}

const validateEmptyAlphanum = (text) => {

    if(validator.isEmpty(text)){
        console.log('El campo esta vacio');
        return false;
    }

    if(!validator.isAlphanumeric(text)){
        console.log('El campo no es alfanumerico');
        return false;
    }

    return true;
}

const validarPass = (text) => {

    if(validator.isEmpty(text)){
        console.log('El campo esta vacio');
        return false;
    }

    return true;
}

const validarEmail = (text) => {

    if(validator.isEmpty(text)){
        console.log('El campo email esta vacio');
        return false;
    }

    if(!validator.isEmail(text)){
        console.log('El campo email no corresponde al formato de email');
        return false;
    }

    return true;
}

const validate = {
    User: (user) => {

        // validar que llegan los campos
        if(!user.name || !user.surname || !user.username || !user.email || !user.password) return false;

        // validar name
        if(validator.isEmpty(user.name)) {
            console.log('El campo name no puede estar vacio');
            return false;
        };

        // validar surname
        if(validator.isEmpty(user.surname)) {
            console.log('El campo surname no puede estar vacio');
            return false;
        };

        // validar username
        if(!validateEmptyAlphanum(user.username)) return false;

        // validar email
        if(!validarEmail(user.email)) return false;

        // validar password
        if(!validarPass(user.password)) return false;

        return true;
    },

    Dog: (dog) => {
        // validar que llega name (nombre del perro) es lo unico required
        if(!dog.name || !dog.gender) {
            console.log('Debe ingresar al menos los campos name y gender');
            return false
        }

        // Validar que name no sea vacio
        if(validator.isEmpty(dog.name)) {
            console.log('Debe indicar el nombre del perro');
            return false
        }

        // Validar que gender no sea vacio
        if(validator.isEmpty(dog.gender)) {
            console.log('Debe indicar el género del perro');
            return false
        }


        // validar peso
        if(dog.weight && !validator.isNumeric(dog.weight)) {
            console.log('El campo weight solo puede contener numeros');
            return false
        }

        // validar edad
        if(dog.age && !validator.isNumeric(dog.age)) {
            console.log('El campo age solo puede contener numeros');
            return false
        }

        return true;
    },

    imageExtension: (extension) => {
        if(extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg' && extension !== 'gif') {
            console.error('la extension del archivo no es valida');
            console.error('Debe ser: png, jpg, jpeg o gif');
            return false;
        };

        return true;
    },

    Post: (post) => {

        console.log(post);

        if(!post.title || !post.description) {
            console.log('Debe enviar los campos title y description');
            return false;
        }

        if(post.title && validator.isEmpty(post.title)) {
            console.log('title no puede ser vacio');
            return false;
        }

        if(post.description && validator.isEmpty(post.description)){
            console.log('description no puede ser vacio');
            return false;
        }

        return true;
    },

    Admin: (user) => {
        if(!user.role || user.role !== 'role-admin') return false;

        return true;
    },
}

export default validate;
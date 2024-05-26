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
        // if(!validator.isEmpty(user.name)) {
        //     console.log('El campo name no puede estar vacio');
        //     return false;
        // };

        // // validar surname
        // if(!validator.isEmpty(user.surname)) {
        //     console.log('El campo surname no puede estar vacio');
        //     return false;
        // };

        // validar username
        if(!validateEmptyAlphanum(user.username)) return false;

        // validar email
        if(!validarEmail(user.email)) return false;

        // validar password
        if(!validarPass(user.password)) return false;

        return true;
    }
}

export default validate;
import mongoose from "mongoose";
import config from "../config.js";

const connection = async() => {
    try{
        await mongoose.connect(config.DB_URL);
        console.log('Database Pelu_canina_DB Connected!');
    }catch(exception){
        console.log(exception)
        throw new Error('No se pudo establecer la conexion con la DB');
    }
}

export default connection;

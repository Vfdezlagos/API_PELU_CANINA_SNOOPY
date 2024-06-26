import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    address: {
        type: String,
        default: 'Sin dirección indicada'
    },
    phone: {
        type: Number,
        default: null
    },
    role: {
        type: String,
        default: 'role-user'
    },
    subscribed: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(paginate);

const userModel = model('User', userSchema, 'users');

export default userModel;
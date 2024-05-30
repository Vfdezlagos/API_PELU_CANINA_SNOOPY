import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";

const dogSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        required: true
    },
    race: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        default: null
    },
    age: {
        type: Number,
        default: null
    },
    image: {
        type: String,
        default: '../public/images/default_image_640x480.jpg'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

dogSchema.plugin(paginate);

const dogModel = model('Dog', dogSchema, 'dogs');

export default dogModel;
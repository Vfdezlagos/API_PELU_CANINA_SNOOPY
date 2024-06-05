import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const postSchema = Schema({
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    owner: {
        type: String
    },
    image1: {
        type: String,
        default: 'public/images/default_image_640x480.jpg'
    },
    image2: {
        type: String,
        default: 'public/images/default_image_640x480.jpg'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

postSchema.plugin(paginate);

const postModel = model('Post', postSchema, 'posts');

export default postModel;

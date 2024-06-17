import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const bannerSchema = Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'default_image.png'
    },
    active: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

bannerSchema.plugin(paginate);

const bannerModel = model('Banner', bannerSchema, 'banners');

export default bannerModel;
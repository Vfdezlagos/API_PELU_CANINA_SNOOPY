import dogModel from "../models/Dog.js"

const getUserDogsImages = async (userId) => {
    const dogImagesArray = await dogModel.find({user: userId}).select('image').exec();

    return dogImagesArray;
}

export {
    getUserDogsImages
}
// const cloudinary=require("cloudinary").v2

// exports.uploadImageToCloudinary= async(file, folder, innerHeight, quality) =>{
//     const options={folder};

//     if(height){
//         options.height=height;
//     }
//     if(quality){
//         options.quality=quality;
//     }
//     options.resource_type="auto";

//     return await cloudinary.uploader.upload(file.tempFilePath, options);
// }

const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        if (!file) {
            throw new Error("No file provided for upload.");
        }

        const options = { folder };

        // Ensure height is defined before adding it
        if (height) {
            options.height = height;
        }

        // Ensure quality is defined before adding it
        if (quality) {
            options.quality = quality;
        }

        options.resource_type = "auto"; // Automatically detect file type

        console.log("Uploading to Cloudinary with options:", options);

        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        return result;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message);
        throw error;
    }
};

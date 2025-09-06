import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (filePath) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API,      
      api_secret: process.env.CLOUD_SECRET 
    });

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto"
    });

    
    fs.unlinkSync(filePath);

    return result; 
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    }
    console.error("Cloudinary upload failed:", error);
    throw error; 
  }
};

export { uploadOnCloudinary };

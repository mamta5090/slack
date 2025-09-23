import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// -----------------------------
// Cloudinary config
// -----------------------------
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

// -----------------------------
// Upload function
// -----------------------------
export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // delete local file after upload
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    // cleanup in case of failure
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

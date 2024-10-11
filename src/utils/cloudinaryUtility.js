import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

dotenv.config();
// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  console.log("Local File path is:", localFilePath);
  try {
    if (localFilePath) {
      const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
      console.log("File uploaded to Cloudinary:", response.secure_url);

      // remove the locally saved temp file after successful upload
      fs.unlinkSync(localFilePath);

      return response.secure_url;
    } else {
      throw new Error("Local file path is missing or invalid");
    }
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);

    if (localFilePath) {
      try {
        // Remove the locally saved temp file as upload failed
        fs.unlinkSync(localFilePath);
      } catch (unlinkError) {
        console.error("Error deleting local file:", unlinkError.message);
      }
    }

    return null;
  }
};

export default uploadOnCloudinary;

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dqaga1s2u",
  api_key: "341773489813215",
  api_secret: "jMK3wZ-gGjheQylT1Nw4Un0KEew",
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "elamen-products",
      format: "jpg",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    };
  },
});

export const upload = multer({ storage });

/**
 * Upload an image to Cloudinary
 * @param filePath - Path to the image file
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(filePath: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "elamen-products",
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  return matches ? matches[1] : null;
}

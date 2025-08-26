import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "abayadesigns",
      transformation: [
        // First transformation: resize to standard dimensions while preserving aspect ratio
        { width: 800, height: 1000, crop: "limit" },
        // Second transformation: optimize quality and format
        { quality: "auto", fetch_format: "auto" }
      ],
    })
    return result.secure_url
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

export default cloudinary

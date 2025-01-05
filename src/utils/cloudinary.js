import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()
//configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        console.log(`File uploaded successfully to cloudinary, File Src: ${response.url}`)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log(error.message)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromColudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("Deleted from cloudinary successFully")
    } catch (error) {
        console.log("Error deleting from cloudinary",error)
        return null

    }
}

export { uploadOnCloudinary, deleteFromColudinary }
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export async function uploadToCloudinary(file: File, folder: string = 'assembly-tracker') {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error: any, result: any) => {
                if (error) reject(error)
                else resolve(result)
            }
        ).end(buffer)
    })
}

export async function deleteFromCloudinary(publicId: string) {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        return result
    } catch (error) {
        console.error('Cloudinary delete error:', error)
        throw error
    }
}

export function extractPublicIdFromUrl(url: string): string | null {
    try {
        // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/
        const match = url.match(regex)
        return match ? match[1] : null
    } catch (error) {
        console.error('Error extracting public ID:', error)
        return null
    }
}

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

/**
 * Upload an image to Cloudinary
 * @param {string} base64Image - Base64 encoded image (with or without data URI prefix)
 * @param {object} options - Upload options
 * @param {string} options.folder - Folder name in Cloudinary (default: 'products')
 * @param {string} options.publicId - Custom public ID for the image
 * @returns {Promise<object>} Cloudinary upload result with secure_url, public_id, etc.
 */
export async function uploadImage(base64Image, options = {}) {
  const { folder = 'lateliergaston/products', publicId } = options

  // Ensure the base64 string has the data URI prefix
  let imageData = base64Image
  if (!base64Image.startsWith('data:')) {
    imageData = `data:image/webp;base64,${base64Image}`
  }

  const uploadOptions = {
    folder,
    resource_type: 'image'
  }

  if (publicId) {
    uploadOptions.public_id = publicId
  }

  try {
    const result = await cloudinary.uploader.upload(imageData, uploadOptions)
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'upload de l\'image'
    }
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<object>} Deletion result
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      result: result.result
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression de l\'image'
    }
  }
}

/**
 * Get optimized URL for an image
 * @param {string} publicId - The public ID of the image
 * @param {object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export function getOptimizedUrl(publicId, options = {}) {
  const { width, height, quality = 'auto' } = options

  const transformations = [{ quality }]

  if (width) transformations.push({ width, crop: 'scale' })
  if (height) transformations.push({ height, crop: 'scale' })

  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations
  })
}

export default cloudinary

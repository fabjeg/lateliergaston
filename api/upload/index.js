import { requireAuth } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import { uploadImage } from '../_lib/cloudinary.js'

// Maximum image size: 5MB (Cloudinary allows up to 10MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const { image, filename, folder } = req.body

    // Validate image is provided
    if (!image) {
      return res.status(400).json(apiResponse(false, null, 'Image requise'))
    }

    // Validate image is base64
    if (typeof image !== 'string') {
      return res.status(400).json(apiResponse(false, null, 'Format d\'image invalide'))
    }

    // Check image size (rough estimate from base64)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const imageSize = Buffer.from(base64Data, 'base64').length

    if (imageSize > MAX_IMAGE_SIZE) {
      return res.status(400).json(
        apiResponse(false, null, `L'image dépasse la taille maximale de ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
      )
    }

    // Validate image format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const imageFormat = image.match(/^data:(image\/\w+);base64,/)

    if (imageFormat && !validFormats.includes(imageFormat[1])) {
      return res.status(400).json(
        apiResponse(false, null, 'Format d\'image non supporté. Utilisez WebP, JPEG ou PNG.')
      )
    }

    // Generate a unique public ID based on filename and timestamp
    const timestamp = Date.now()
    const cleanFilename = filename
      ? filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
      : 'image'
    const publicId = `${cleanFilename}_${timestamp}`

    // Upload to Cloudinary
    const result = await uploadImage(image, {
      folder: folder || 'lateliergaston/products',
      publicId
    })

    if (!result.success) {
      return res.status(500).json(apiResponse(false, null, result.error))
    }

    return res.status(200).json(apiResponse(true, {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }, 'Image uploadée avec succès'))

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur lors de l\'upload de l\'image')
    )
  }
}

export default requireAuth(handler)

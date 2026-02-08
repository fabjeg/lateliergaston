import { v2 as cloudinary } from 'cloudinary'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Methode non autorisee'))
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'lateliergaston/custom-orders'

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    )

    return res.status(200).json(apiResponse(true, {
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    }))
  } catch (error) {
    console.error('Cloudinary signature error:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

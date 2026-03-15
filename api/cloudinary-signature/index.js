import { v2 as cloudinary } from 'cloudinary'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import { verifySession } from '../_lib/auth.js'
import cookie from 'cookie'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

const ADMIN_FOLDERS = ['lateliergaston/products', 'lateliergaston/about']

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Methode non autorisee'))
  }

  try {
    const { folder = 'lateliergaston/custom-orders', filename } = req.body || {}

    // Admin-only folders require authentication
    if (ADMIN_FOLDERS.includes(folder)) {
      const cookies = cookie.parse(req.headers.cookie || '')
      const admin = await verifySession(cookies.admin_session)
      if (!admin) {
        return res.status(401).json(apiResponse(false, null, 'Non autorisé'))
      }
    }

    const timestamp = Math.round(Date.now() / 1000)
    let paramsToSign
    let publicId = null

    if (filename) {
      // When public_id is specified with full path, don't include folder in signature
      const cleanFilename = filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
      publicId = `${folder}/${cleanFilename}_${timestamp}`
      paramsToSign = { timestamp, public_id: publicId }
    } else {
      // No public_id — Cloudinary auto-generates, folder required
      paramsToSign = { timestamp, folder }
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    )

    return res.status(200).json(apiResponse(true, {
      signature,
      timestamp,
      folder,
      publicId,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    }))
  } catch (error) {
    console.error('Cloudinary signature error:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

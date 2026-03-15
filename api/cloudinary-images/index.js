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

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method !== 'GET') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  // Auth required
  const cookies = cookie.parse(req.headers.cookie || '')
  const admin = await verifySession(cookies.admin_session)
  if (!admin) {
    return res.status(401).json(apiResponse(false, null, 'Non autorisé'))
  }

  try {
    const folder = req.query.folder || 'lateliergaston'
    const nextCursor = req.query.next_cursor || undefined

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 50,
      next_cursor: nextCursor,
      resource_type: 'image'
    })

    const images = result.resources.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      filename: r.public_id.split('/').pop(),
      width: r.width,
      height: r.height,
      createdAt: r.created_at
    }))

    return res.status(200).json(apiResponse(true, {
      images,
      nextCursor: result.next_cursor || null
    }))
  } catch (error) {
    console.error('Cloudinary list error:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur lors du chargement des images'))
  }
}

import cookie from 'cookie'
import { verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session

    // Verify session
    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(
        apiResponse(false, null, 'Session invalide ou expirée')
      )
    }

    // Return admin info
    return res.status(200).json(
      apiResponse(true, {
        admin: {
          username: admin.username,
          role: admin.role
        }
      })
    )
  } catch (error) {
    console.error('Verify session error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur serveur')
    )
  }
}

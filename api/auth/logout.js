import cookie from 'cookie'
import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session

    if (sessionId) {
      // Delete session from database
      const sessionsCollection = await getCollection('sessions')
      await sessionsCollection.deleteOne({ sessionId })
    }

    // Clear session cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Expire immediately
        path: '/'
      })
    )

    return res.status(200).json(
      apiResponse(true, { message: 'Déconnexion réussie' })
    )
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur serveur')
    )
  }
}

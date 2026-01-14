import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import cookie from 'cookie'
import { getCollection } from '../_lib/mongodb.js'
import { rateLimit } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitCheck = await rateLimit(5, 15 * 60 * 1000)(req, res)
    if (rateLimitCheck === false) return // Rate limit exceeded

    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json(
        apiResponse(false, null, 'Nom d\'utilisateur et mot de passe requis')
      )
    }

    // Find admin by username
    const adminsCollection = await getCollection('admins')
    const admin = await adminsCollection.findOne({ username })

    if (!admin) {
      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash)

    if (!passwordMatch) {
      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    // Create session
    const sessionId = uuidv4()
    const sessionsCollection = await getCollection('sessions')

    const session = {
      sessionId,
      adminId: admin._id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }

    await sessionsCollection.insertOne(session)

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    }

    res.setHeader('Set-Cookie', cookie.serialize('admin_session', sessionId, cookieOptions))

    // Return success
    return res.status(200).json(
      apiResponse(true, {
        admin: {
          username: admin.username,
          role: admin.role
        }
      })
    )
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur serveur')
    )
  }
}

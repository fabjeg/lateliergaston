import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import cookie from 'cookie'
import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import {
  getClientIP,
  logLoginAttempt,
  isIPBlocked,
  isUsernameBlocked,
  recordFailedAttempt,
  clearFailedAttempts,
  getRemainingLockoutTime
} from '../_lib/security.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  const ip = getClientIP(req)
  const userAgent = req.headers['user-agent']

  try {
    const { username, password } = req.body

    // Validate input
    if (!username || !password) {
      return res.status(400).json(
        apiResponse(false, null, 'Nom d\'utilisateur et mot de passe requis')
      )
    }

    // Sanitize username (lowercase, trim)
    const sanitizedUsername = username.toLowerCase().trim()

    // Check if IP is blocked
    if (await isIPBlocked(ip)) {
      const remainingTime = await getRemainingLockoutTime(ip, sanitizedUsername)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(429).json(
        apiResponse(false, null, `Trop de tentatives. Réessayez dans ${remainingTime} minutes.`)
      )
    }

    // Check if username is blocked
    if (await isUsernameBlocked(sanitizedUsername)) {
      const remainingTime = await getRemainingLockoutTime(ip, sanitizedUsername)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(429).json(
        apiResponse(false, null, `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`)
      )
    }

    // Find admin by username
    const adminsCollection = await getCollection('admins')
    const admin = await adminsCollection.findOne({
      username: sanitizedUsername
    })

    if (!admin) {
      // Record failed attempt even if user doesn't exist (prevent user enumeration)
      await recordFailedAttempt(sanitizedUsername, ip)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)

      // Use same error message to prevent user enumeration
      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash)

    if (!passwordMatch) {
      await recordFailedAttempt(sanitizedUsername, ip)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)

      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    // Successful login - clear any failed attempts
    await clearFailedAttempts(sanitizedUsername, ip)
    await logLoginAttempt(sanitizedUsername, ip, true, userAgent)

    // Create session with shorter duration (24 hours)
    const sessionId = uuidv4()
    const sessionsCollection = await getCollection('sessions')

    // Keep only the most recent session (allow max 2 sessions)
    const existingSessions = await sessionsCollection
      .find({ adminId: admin._id })
      .sort({ createdAt: -1 })
      .toArray()

    if (existingSessions.length >= 2) {
      // Delete oldest sessions, keep only the most recent one
      const sessionsToDelete = existingSessions.slice(1).map(s => s._id)
      await sessionsCollection.deleteMany({ _id: { $in: sessionsToDelete } })
    }

    const session = {
      sessionId,
      adminId: admin._id,
      ip, // Store IP for additional validation
      userAgent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    await sessionsCollection.insertOne(session)

    // Set session cookie with secure options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
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
    await logLoginAttempt('unknown', ip, false, userAgent)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur serveur')
    )
  }
}

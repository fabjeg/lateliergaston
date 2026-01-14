import { getCollection } from './mongodb.js'
import cookie from 'cookie'

/**
 * Verify if a session is valid
 * @param {string} sessionId
 * @returns {Promise<object|null>} Admin object if valid, null otherwise
 */
export async function verifySession(sessionId) {
  if (!sessionId) {
    return null
  }

  try {
    const sessionsCollection = await getCollection('sessions')
    const session = await sessionsCollection.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    })

    if (!session) {
      return null
    }

    // Get admin details
    const adminsCollection = await getCollection('admins')
    const admin = await adminsCollection.findOne({
      _id: session.adminId
    }, {
      projection: { passwordHash: 0 } // Don't return password hash
    })

    return admin
  } catch (error) {
    console.error('Error verifying session:', error)
    return null
  }
}

/**
 * Authentication middleware for API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} Wrapped handler with auth check
 */
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      // Parse cookies
      const cookies = cookie.parse(req.headers.cookie || '')
      const sessionId = cookies.admin_session

      // Verify session
      const admin = await verifySession(sessionId)

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé. Veuillez vous connecter.'
        })
      }

      // Attach admin to request object
      req.admin = admin

      // Call the actual handler
      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      })
    }
  }
}

/**
 * Rate limiting map (in-memory, resets on serverless function cold start)
 * In production, use Redis or similar for persistent rate limiting
 */
const rateLimitMap = new Map()

/**
 * Simple rate limiting middleware
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
export function rateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const now = Date.now()

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
      return next ? next() : true
    }

    const record = rateLimitMap.get(ip)

    // Reset if window expired
    if (now > record.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
      return next ? next() : true
    }

    // Check if limit exceeded
    if (record.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        error: 'Trop de tentatives. Veuillez réessayer plus tard.'
      })
    }

    // Increment counter
    record.count++
    return next ? next() : true
  }
}

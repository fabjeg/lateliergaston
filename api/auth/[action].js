import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import cookie from 'cookie'
import { getCollection } from '../_lib/mongodb.js'
import { verifySession } from '../_lib/auth.js'
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
  if (handleCorsOptions(req, res)) return

  const { action } = req.query

  switch (action) {
    case 'login':
      return handleLogin(req, res)
    case 'logout':
      return handleLogout(req, res)
    case 'verify':
      return handleVerify(req, res)
    default:
      return res.status(404).json(apiResponse(false, null, 'Route non trouvee'))
  }
}

// ── Login ────────────────────────────────────────────

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  const ip = getClientIP(req)
  const userAgent = req.headers['user-agent']

  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json(
        apiResponse(false, null, 'Nom d\'utilisateur et mot de passe requis')
      )
    }

    const sanitizedUsername = username.toLowerCase().trim()

    if (await isIPBlocked(ip)) {
      const remainingTime = await getRemainingLockoutTime(ip, sanitizedUsername)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(429).json(
        apiResponse(false, null, `Trop de tentatives. Réessayez dans ${remainingTime} minutes.`)
      )
    }

    if (await isUsernameBlocked(sanitizedUsername)) {
      const remainingTime = await getRemainingLockoutTime(ip, sanitizedUsername)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(429).json(
        apiResponse(false, null, `Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes.`)
      )
    }

    const adminsCollection = await getCollection('admins')
    const admin = await adminsCollection.findOne({
      username: sanitizedUsername
    })

    if (!admin) {
      await recordFailedAttempt(sanitizedUsername, ip)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    const passwordMatch = await bcrypt.compare(password, admin.passwordHash)

    if (!passwordMatch) {
      await recordFailedAttempt(sanitizedUsername, ip)
      await logLoginAttempt(sanitizedUsername, ip, false, userAgent)
      return res.status(401).json(
        apiResponse(false, null, 'Identifiants invalides')
      )
    }

    await clearFailedAttempts(sanitizedUsername, ip)
    await logLoginAttempt(sanitizedUsername, ip, true, userAgent)

    const sessionId = uuidv4()
    const sessionsCollection = await getCollection('sessions')

    const existingSessions = await sessionsCollection
      .find({ adminId: admin._id })
      .sort({ createdAt: -1 })
      .toArray()

    if (existingSessions.length >= 2) {
      const sessionsToDelete = existingSessions.slice(1).map(s => s._id)
      await sessionsCollection.deleteMany({ _id: { $in: sessionsToDelete } })
    }

    const session = {
      sessionId,
      adminId: admin._id,
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    await sessionsCollection.insertOne(session)

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/'
    }

    res.setHeader('Set-Cookie', cookie.serialize('admin_session', sessionId, cookieOptions))

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

// ── Logout ───────────────────────────────────────────

async function handleLogout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session

    if (sessionId) {
      const sessionsCollection = await getCollection('sessions')
      await sessionsCollection.deleteOne({ sessionId })
    }

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('admin_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
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

// ── Verify ───────────────────────────────────────────

async function handleVerify(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session

    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(
        apiResponse(false, null, 'Session invalide ou expirée')
      )
    }

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

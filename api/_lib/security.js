import { getCollection } from './mongodb.js'

/**
 * Security module for login protection
 */

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Get client IP from request
 */
export function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown'
}

/**
 * Log a login attempt
 */
export async function logLoginAttempt(username, ip, success, userAgent) {
  try {
    const logsCollection = await getCollection('login_logs')
    await logsCollection.insertOne({
      username,
      ip,
      success,
      userAgent: userAgent || 'unknown',
      timestamp: new Date()
    })

    // Clean old logs (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await logsCollection.deleteMany({ timestamp: { $lt: thirtyDaysAgo } })
  } catch (error) {
    console.error('Error logging login attempt:', error)
  }
}

/**
 * Check if IP is blocked due to too many failed attempts
 */
export async function isIPBlocked(ip) {
  try {
    const blockCollection = await getCollection('blocked_ips')
    const block = await blockCollection.findOne({
      ip,
      blockedUntil: { $gt: new Date() }
    })
    return !!block
  } catch (error) {
    console.error('Error checking IP block:', error)
    return false
  }
}

/**
 * Check if username is blocked due to too many failed attempts
 */
export async function isUsernameBlocked(username) {
  try {
    const blockCollection = await getCollection('blocked_users')
    const block = await blockCollection.findOne({
      username,
      blockedUntil: { $gt: new Date() }
    })
    return !!block
  } catch (error) {
    console.error('Error checking username block:', error)
    return false
  }
}

/**
 * Record a failed login attempt and potentially block
 */
export async function recordFailedAttempt(username, ip) {
  try {
    const attemptsCollection = await getCollection('failed_attempts')
    const now = new Date()
    const windowStart = new Date(now.getTime() - FAILED_ATTEMPT_WINDOW_MS)

    // Record this attempt
    await attemptsCollection.insertOne({
      username,
      ip,
      timestamp: now
    })

    // Count recent failed attempts for this IP
    const ipAttempts = await attemptsCollection.countDocuments({
      ip,
      timestamp: { $gt: windowStart }
    })

    // Count recent failed attempts for this username
    const userAttempts = await attemptsCollection.countDocuments({
      username,
      timestamp: { $gt: windowStart }
    })

    // Block IP if too many attempts
    if (ipAttempts >= MAX_FAILED_ATTEMPTS) {
      const blockCollection = await getCollection('blocked_ips')
      await blockCollection.updateOne(
        { ip },
        {
          $set: {
            ip,
            blockedUntil: new Date(now.getTime() + LOCKOUT_DURATION_MS),
            reason: 'Too many failed login attempts',
            attempts: ipAttempts
          }
        },
        { upsert: true }
      )
    }

    // Block username if too many attempts
    if (userAttempts >= MAX_FAILED_ATTEMPTS) {
      const blockCollection = await getCollection('blocked_users')
      await blockCollection.updateOne(
        { username },
        {
          $set: {
            username,
            blockedUntil: new Date(now.getTime() + LOCKOUT_DURATION_MS),
            reason: 'Too many failed login attempts',
            attempts: userAttempts
          }
        },
        { upsert: true }
      )
    }

    // Clean old attempts
    await attemptsCollection.deleteMany({
      timestamp: { $lt: windowStart }
    })

    return { ipAttempts, userAttempts }
  } catch (error) {
    console.error('Error recording failed attempt:', error)
    return { ipAttempts: 0, userAttempts: 0 }
  }
}

/**
 * Clear failed attempts after successful login
 */
export async function clearFailedAttempts(username, ip) {
  try {
    const attemptsCollection = await getCollection('failed_attempts')
    await attemptsCollection.deleteMany({
      $or: [{ username }, { ip }]
    })

    // Also remove any blocks
    const blockedIPs = await getCollection('blocked_ips')
    const blockedUsers = await getCollection('blocked_users')
    await blockedIPs.deleteOne({ ip })
    await blockedUsers.deleteOne({ username })
  } catch (error) {
    console.error('Error clearing failed attempts:', error)
  }
}

/**
 * Get remaining lockout time in minutes
 */
export async function getRemainingLockoutTime(ip, username) {
  try {
    const blockIPCollection = await getCollection('blocked_ips')
    const blockUserCollection = await getCollection('blocked_users')

    const ipBlock = await blockIPCollection.findOne({ ip })
    const userBlock = await blockUserCollection.findOne({ username })

    let maxBlockedUntil = null

    if (ipBlock?.blockedUntil > new Date()) {
      maxBlockedUntil = ipBlock.blockedUntil
    }
    if (userBlock?.blockedUntil > new Date()) {
      if (!maxBlockedUntil || userBlock.blockedUntil > maxBlockedUntil) {
        maxBlockedUntil = userBlock.blockedUntil
      }
    }

    if (maxBlockedUntil) {
      return Math.ceil((maxBlockedUntil.getTime() - Date.now()) / 60000)
    }
    return 0
  } catch (error) {
    console.error('Error getting lockout time:', error)
    return 0
  }
}

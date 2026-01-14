/**
 * Set CORS headers for API responses
 * @param {object} res - Response object
 */
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
}

/**
 * Handle OPTIONS requests for CORS preflight
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {boolean} True if OPTIONS request was handled
 */
export function handleCorsOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res)
    res.status(200).end()
    return true
  }
  setCorsHeaders(res)
  return false
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize string to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000) // Max length 1000 chars
}

/**
 * Validate image base64 format and size
 * @param {string} base64String
 * @param {number} maxSizeKB - Maximum size in KB (default 500KB)
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageBase64(base64String, maxSizeKB = 500) {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Image invalide' }
  }

  // Check if it's a valid data URL
  const dataUrlRegex = /^data:image\/(webp|jpeg|jpg|png);base64,/
  if (!dataUrlRegex.test(base64String)) {
    return { valid: false, error: 'Format d\'image non supporté. Utilisez WebP, JPEG ou PNG.' }
  }

  // Calculate size (base64 is ~1.37x larger than binary)
  const base64Length = base64String.split(',')[1]?.length || 0
  const sizeInKB = (base64Length * 0.75) / 1024 // Convert to KB

  if (sizeInKB > maxSizeKB) {
    return {
      valid: false,
      error: `Image trop grande (${Math.round(sizeInKB)}KB). Maximum: ${maxSizeKB}KB`
    }
  }

  return { valid: true }
}

/**
 * Validate product data
 * @param {object} product
 * @returns {{valid: boolean, errors?: string[]}}
 */
export function validateProduct(product) {
  const errors = []

  if (!product.name || product.name.trim().length < 3) {
    errors.push('Le nom doit contenir au moins 3 caractères')
  }

  if (!product.price || typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Le prix doit être un nombre positif')
  }

  if (product.description && product.description.length > 2000) {
    errors.push('La description ne peut pas dépasser 2000 caractères')
  }

  if (product.status && !['available', 'sold', 'hidden'].includes(product.status)) {
    errors.push('Statut invalide. Utilisez: available, sold, ou hidden')
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Create a standardized API response
 * @param {boolean} success
 * @param {object} data
 * @param {string} error
 * @returns {object}
 */
export function apiResponse(success, data = null, error = null) {
  const response = { success }
  if (data) response.data = data
  if (error) response.error = error
  return response
}

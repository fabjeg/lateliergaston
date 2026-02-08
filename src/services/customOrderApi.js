/**
 * API service for custom order management (sur-mesure)
 */

const API_BASE = '/api/custom-orders'

/**
 * Create a new custom order
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, orderId?: string, error?: string}>}
 */
export async function createCustomOrder(orderData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, orderId: data.data.order.id, uploadedPhotoUrl: data.data.order.uploadedPhotoUrl || null }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Create custom order error:', error)
    return { success: false, error: 'Erreur de connexion au serveur' }
  }
}

/**
 * Get all custom orders (admin only)
 * @returns {Promise<{success: boolean, orders?: Array, error?: string}>}
 */
export async function getAllCustomOrders() {
  try {
    const response = await fetch(API_BASE, {
      credentials: 'include'
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, orders: data.data.orders }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Get custom orders error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Convert file to base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

/**
 * Upload a file directly to Cloudinary (bypasses Vercel body size limit)
 * 1. Gets a signed upload config from our API
 * 2. Uploads the file directly to Cloudinary from the browser
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadDirectToCloudinary(file) {
  try {
    // Step 1: Get signature from our API
    const sigResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const sigData = await sigResponse.json()

    if (!sigData.success) {
      return { success: false, error: 'Impossible de préparer l\'upload' }
    }

    const { signature, timestamp, folder, apiKey, cloudName } = sigData.data

    // Step 2: Upload directly to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', signature)
    formData.append('timestamp', timestamp)
    formData.append('folder', folder)
    formData.append('api_key', apiKey)

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    const uploadResult = await uploadResponse.json()

    if (uploadResult.secure_url) {
      return { success: true, url: uploadResult.secure_url }
    }

    return { success: false, error: uploadResult.error?.message || 'Erreur lors de l\'upload' }
  } catch (error) {
    console.error('Direct Cloudinary upload error:', error)
    return { success: false, error: 'Erreur lors de l\'upload de la photo' }
  }
}

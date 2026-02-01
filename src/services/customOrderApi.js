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

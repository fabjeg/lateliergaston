/**
 * API service for product management
 */

import { adminFetch } from '../utils/adminFetch'

const API_BASE = '/api/products'

/**
 * Upload image directly to Cloudinary (bypasses Vercel 4.5MB body limit)
 * @param {File} file - File object from input
 * @param {string} filename - Original filename
 * @returns {Promise<{success: boolean, url?: string, publicId?: string, error?: string}>}
 */
export async function uploadImage(file, filename) {
  try {
    // Step 1: Get a signed upload URL from our backend
    const signRes = await adminFetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ filename: filename || file.name, folder: 'lateliergaston/products' })
    })

    const signData = await signRes.json()
    if (!signData.success) {
      return { success: false, error: signData.error || 'Erreur de signature' }
    }

    const { signature, timestamp, publicId, apiKey, cloudName } = signData.data

    // Step 2: Upload directly to Cloudinary (no size limit from Vercel)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('public_id', publicId)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    const result = await uploadRes.json()

    if (result.secure_url) {
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    } else {
      return { success: false, error: result.error?.message || 'Erreur lors de l\'upload' }
    }
  } catch (error) {
    console.error('Upload image error:', error)
    return { success: false, error: 'Erreur lors de l\'upload de l\'image' }
  }
}

/**
 * Get all products (public - excludes hidden)
 */
export async function getAllProducts() {
  try {
    const response = await fetch(API_BASE, {
      credentials: 'include'
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, products: data.data.products }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Get products error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Get all products including hidden (admin only)
 */
export async function getAllProductsAdmin() {
  try {
    const response = await adminFetch(`${API_BASE}?includeHidden=true`, {
      credentials: 'include'
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, products: data.data.products }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Get products admin error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Update product status quickly (admin only)
 */
export async function updateProductStatus(id, status) {
  try {
    const response = await adminFetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, product: data.data.product }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Update status error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Get single product by ID
 */
export async function getProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      credentials: 'include'
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, product: data.data.product }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Get product error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Create new product (admin only)
 */
export async function createProduct(productData) {
  try {
    const response = await adminFetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, product: data.data.product }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Create product error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Update product (admin only)
 */
export async function updateProduct(id, productData) {
  try {
    const response = await adminFetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, product: data.data.product }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Update product error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Reorder products (admin only)
 * @param {number[]} orderedIds - Array of product IDs in the desired order
 */
export async function reorderProducts(orderedIds) {
  try {
    const response = await adminFetch(API_BASE, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ orderedIds })
    })

    const data = await response.json()

    if (data.success) {
      return { success: true }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Reorder products error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(id) {
  try {
    const response = await adminFetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, id: data.data.id }
    } else {
      return { success: false, error: data.error }
    }
  } catch (error) {
    console.error('Delete product error:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

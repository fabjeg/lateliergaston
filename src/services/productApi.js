/**
 * API service for product management
 */

const API_BASE = '/api/products'

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
    const response = await fetch(`${API_BASE}?includeHidden=true`, {
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
    const response = await fetch(`${API_BASE}/${id}`, {
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
    const response = await fetch(`${API_BASE}/create`, {
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
    const response = await fetch(`${API_BASE}/${id}`, {
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
 * Delete product (admin only)
 */
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
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

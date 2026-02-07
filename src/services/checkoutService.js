const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Create a Stripe Checkout session via server and redirect
 *
 * @param {Array} cartItems - Array of cart items with id and quantity
 * @param {string} shippingZone - Shipping zone (FR, EU, WORLD)
 * @returns {Promise<void>}
 */
export async function createCheckoutSession(cartItems, shippingZone) {
  try {
    const items = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
    }))

    const response = await fetch(`${API_URL}/api/checkout/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, shippingZone }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erreur lors de la creation de la session de paiement')
    }

    // Redirect to Stripe Checkout
    window.location.href = data.data.url
  } catch (error) {
    console.error('Erreur lors de la creation de la session de paiement:', error)
    throw error
  }
}

/**
 * Validate cart before checkout
 * Ensures all required fields are present
 *
 * @param {Array} cartItems - Cart items to validate
 * @returns {object} { isValid: boolean, errors: Array<string> }
 */
export function validateCartForCheckout(cartItems) {
  const errors = []

  if (!cartItems || cartItems.length === 0) {
    errors.push('Le panier est vide')
    return { isValid: false, errors }
  }

  for (const item of cartItems) {
    if (!item.id) {
      errors.push(`L'article "${item.name}" n'a pas d'identifiant`)
    }
    if (item.quantity <= 0) {
      errors.push(`La quantite pour "${item.name}" est invalide`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

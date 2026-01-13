import { stripePromise } from '../config/stripe'
import { getShippingPriceId } from '../utils/shipping'

/**
 * Create a Stripe Checkout session and redirect to Stripe
 *
 * @param {Array} cartItems - Array of cart items with stripePriceId and quantity
 * @param {string} shippingZone - Shipping zone (FR, EU, WORLD)
 * @returns {Promise<void>}
 */
export async function createCheckoutSession(cartItems, shippingZone) {
  try {
    const stripe = await stripePromise

    if (!stripe) {
      throw new Error('Stripe n\'a pas pu être chargé')
    }

    // Build line items from cart
    const lineItems = cartItems.map(item => ({
      price: item.stripePriceId,
      quantity: item.quantity
    }))

    // Add shipping as a line item (only if configured in Stripe)
    const shippingPriceId = getShippingPriceId(shippingZone)
    if (shippingPriceId && shippingPriceId !== '') {
      lineItems.push({
        price: shippingPriceId,
        quantity: 1
      })
    } else {
      console.warn('Frais de livraison non configurés dans Stripe - checkout sans livraison')
    }

    // Create metadata with product IDs for webhook
    const metadata = {
      productIds: cartItems.map(item => item.id).join(','),
      quantities: cartItems.map(item => item.quantity).join(','),
      shippingZone: shippingZone
    }

    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      lineItems,
      mode: 'payment',
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cart`,
      clientReferenceId: Date.now().toString(),
      metadata
    })

    if (error) {
      console.error('Erreur Stripe:', error)
      throw error
    }
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error)
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
    if (!item.stripePriceId) {
      errors.push(`L'article "${item.name}" n'a pas de prix Stripe configuré`)
    }
    if (item.quantity <= 0) {
      errors.push(`La quantité pour "${item.name}" est invalide`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

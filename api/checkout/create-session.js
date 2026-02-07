import Stripe from 'stripe'
import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const SHIPPING_COSTS = {
  FR: { label: 'Livraison France', amount: 1500 },
  EU: { label: 'Livraison Europe', amount: 2500 },
  WORLD: { label: 'Livraison Internationale', amount: 4000 },
}

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Methode non autorisee'))
  }

  try {
    // Check if shop is enabled
    const settingsCol = await getCollection('settings')
    const settings = await settingsCol.findOne({ _id: 'main' })
    if (settings && settings.shopEnabled === false) {
      return res.status(403).json(apiResponse(false, null, 'Les ventes en ligne sont actuellement desactivees.'))
    }

    const { items, shippingZone } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(apiResponse(false, null, 'Le panier est vide'))
    }

    if (!shippingZone || !SHIPPING_COSTS[shippingZone]) {
      return res.status(400).json(apiResponse(false, null, 'Zone de livraison invalide'))
    }

    // Fetch products from MongoDB and verify availability + prices
    const productsCol = await getCollection('products')
    const productIds = items.map(item => {
      try { return new ObjectId(item.id) } catch { return null }
    }).filter(Boolean)

    if (productIds.length !== items.length) {
      return res.status(400).json(apiResponse(false, null, 'Un ou plusieurs identifiants de produits sont invalides'))
    }

    const products = await productsCol.find({ _id: { $in: productIds } }).toArray()

    if (products.length !== items.length) {
      return res.status(400).json(apiResponse(false, null, 'Un ou plusieurs produits sont introuvables'))
    }

    // Build line items from verified DB data
    const lineItems = []
    const orderItems = []

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.id)

      if (!product) {
        return res.status(400).json(apiResponse(false, null, `Produit introuvable: ${item.id}`))
      }

      if (product.status !== 'available') {
        return res.status(400).json(apiResponse(false, null, `"${product.name}" n'est plus disponible`))
      }

      if (!product.price || product.price <= 0) {
        return res.status(400).json(apiResponse(false, null, `Prix invalide pour "${product.name}"`))
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            ...(product.images?.[0] && { images: [product.images[0]] }),
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      })

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity,
      })
    }

    // Add shipping as a line item
    const shipping = SHIPPING_COSTS[shippingZone]
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: shipping.label },
        unit_amount: shipping.amount,
      },
      quantity: 1,
    })

    // Determine origin for success/cancel URLs
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || process.env.FRONTEND_URL || 'https://lateliergaston.vercel.app'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: [
          'FR', 'DE', 'BE', 'IT', 'ES', 'PT', 'NL', 'AT', 'CH', 'GB',
          'IE', 'LU', 'DK', 'SE', 'FI', 'NO', 'PL', 'CZ', 'GR', 'HU',
          'RO', 'BG', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT', 'CY', 'MT',
          'US', 'CA', 'AU', 'JP',
        ],
      },
      metadata: {
        productIds: orderItems.map(i => i.productId).join(','),
        quantities: orderItems.map(i => i.quantity).join(','),
        shippingZone,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    })

    return res.status(200).json(apiResponse(true, { url: session.url }))
  } catch (error) {
    console.error('Checkout session error:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur lors de la creation de la session de paiement'))
  }
}

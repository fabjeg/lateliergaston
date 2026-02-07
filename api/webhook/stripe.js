import Stripe from 'stripe'
import { getCollection } from '../_lib/mongodb.js'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Disable body parsing so we get the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode non autorisee' })
  }

  let event

  try {
    const rawBody = await getRawBody(req)
    const signature = req.headers['stripe-signature']

    if (!signature) {
      return res.status(400).json({ error: 'Signature manquante' })
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.payment_status === 'paid') {
      try {
        await handleSuccessfulPayment(session)
      } catch (err) {
        console.error('Error processing payment:', err)
        // Still return 200 to Stripe so it doesn't retry
      }
    }
  }

  return res.status(200).json({ received: true })
}

async function handleSuccessfulPayment(session) {
  const { productIds, quantities, shippingZone } = session.metadata || {}

  if (!productIds) {
    console.error('No productIds in session metadata')
    return
  }

  const ids = productIds.split(',')
  const qtys = quantities ? quantities.split(',').map(Number) : ids.map(() => 1)

  // Mark products as sold
  const productsCol = await getCollection('products')
  const objectIds = ids.map(id => {
    try { return new ObjectId(id) } catch { return null }
  }).filter(Boolean)

  await productsCol.updateMany(
    { _id: { $in: objectIds }, status: 'available' },
    { $set: { status: 'sold', soldAt: new Date() } }
  )

  // Create order document
  const ordersCol = await getCollection('orders')
  const orderItems = ids.map((id, i) => ({
    productId: id,
    quantity: qtys[i] || 1,
  }))

  await ordersCol.insertOne({
    stripeSessionId: session.id,
    stripePaymentIntent: session.payment_intent,
    customerEmail: session.customer_details?.email || null,
    customerName: session.customer_details?.name || null,
    shippingAddress: session.shipping_details?.address || null,
    shippingZone: shippingZone || null,
    items: orderItems,
    amountTotal: session.amount_total,
    currency: session.currency,
    status: 'paid',
    createdAt: new Date(),
  })

  console.log(`Order created for session ${session.id} - ${ids.length} product(s) marked as sold`)
}

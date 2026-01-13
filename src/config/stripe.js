import { loadStripe } from '@stripe/stripe-js'

// Load Stripe with publishable key from environment variables
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

export default stripePromise

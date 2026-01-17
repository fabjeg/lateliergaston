import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import { verifySession } from '../_lib/auth.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow GET for public access
  if (req.method !== 'GET') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const productsCollection = await getCollection('products')

    // Check if admin wants to include hidden products
    const includeHidden = req.query.includeHidden === 'true'
    let isAdmin = false

    if (includeHidden) {
      // Verify admin session
      const cookies = cookie.parse(req.headers.cookie || '')
      const sessionId = cookies.admin_session
      const admin = await verifySession(sessionId)
      isAdmin = !!admin
    }

    // Build query - include hidden only if admin is authenticated
    const query = (includeHidden && isAdmin)
      ? {} // Admin can see all products
      : { status: { $ne: 'hidden' } } // Public can't see hidden products

    // Get products
    const products = await productsCollection
      .find(query)
      .sort({ id: 1 })
      .toArray()

    // Transform products for frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      height: product.height,
      width: product.width,
      image: product.imageBase64,
      imageFilename: product.imageFilename,
      stripePriceId: product.stripePriceId,
      status: product.status,
      technique: product.technique,
      year: product.year,
      framed: product.framed,
      collectionId: product.collectionId
    }))

    return res.status(200).json(
      apiResponse(true, { products: transformedProducts })
    )
  } catch (error) {
    console.error('Get products error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur lors de la récupération des produits')
    )
  }
}

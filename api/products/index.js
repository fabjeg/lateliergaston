import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow GET for public access
  if (req.method !== 'GET') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const productsCollection = await getCollection('products')

    // Get all products that are available (not hidden)
    // Sort by id ascending
    const products = await productsCollection
      .find({
        status: { $ne: 'hidden' } // Don't show hidden products to public
      })
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
      status: product.status
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

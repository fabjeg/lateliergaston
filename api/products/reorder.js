import { getCollection } from '../_lib/mongodb.js'
import { requireAuth } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'

async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow PUT
  if (req.method !== 'PUT') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const { orderedIds } = req.body

    // Validate input
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json(
        apiResponse(false, null, 'Liste des IDs requise')
      )
    }

    const productsCollection = await getCollection('products')

    // Update displayOrder for each product
    const updatePromises = orderedIds.map((productId, index) =>
      productsCollection.updateOne(
        { id: productId },
        { $set: { displayOrder: index + 1, updatedAt: new Date() } }
      )
    )

    await Promise.all(updatePromises)

    return res.status(200).json(
      apiResponse(true, { updatedCount: orderedIds.length }, 'Ordre mis à jour avec succès')
    )
  } catch (error) {
    console.error('Reorder products error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur lors de la réorganisation des produits')
    )
  }
}

export default requireAuth(handler)

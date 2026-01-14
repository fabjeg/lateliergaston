import { getCollection } from '../../_lib/mongodb.js'
import { requireAuth } from '../../_lib/auth.js'
import { handleCorsOptions, apiResponse, validateProduct, validateImageBase64, sanitizeString } from '../../_lib/utils.js'

async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  const { id } = req.query

  if (!id) {
    return res.status(400).json(apiResponse(false, null, 'ID produit requis'))
  }

  const productId = parseInt(id)
  if (isNaN(productId)) {
    return res.status(400).json(apiResponse(false, null, 'ID produit invalide'))
  }

  const productsCollection = await getCollection('products')

  // GET - Get single product (PUBLIC)
  if (req.method === 'GET') {
    try {
      const product = await productsCollection.findOne({ id: productId })

      if (!product) {
        return res.status(404).json(apiResponse(false, null, 'Produit non trouvé'))
      }

      // Don't show hidden products to public
      if (product.status === 'hidden') {
        return res.status(404).json(apiResponse(false, null, 'Produit non trouvé'))
      }

      return res.status(200).json(
        apiResponse(true, {
          product: {
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
          }
        })
      )
    } catch (error) {
      console.error('Get product error:', error)
      return res.status(500).json(
        apiResponse(false, null, 'Erreur lors de la récupération du produit')
      )
    }
  }

  // PUT - Update product
  if (req.method === 'PUT') {
    try {
      const { name, price, description, height, width, imageBase64, imageFilename, stripePriceId, status } = req.body

      // Check if product exists
      const existingProduct = await productsCollection.findOne({ id: productId })
      if (!existingProduct) {
        return res.status(404).json(apiResponse(false, null, 'Produit non trouvé'))
      }

      // Validate product data
      const productValidation = validateProduct({ name, price, description, status })
      if (!productValidation.valid) {
        return res.status(400).json(
          apiResponse(false, null, productValidation.errors.join(', '))
        )
      }

      // Validate image if provided
      if (imageBase64) {
        const imageValidation = validateImageBase64(imageBase64)
        if (!imageValidation.valid) {
          return res.status(400).json(apiResponse(false, null, imageValidation.error))
        }
      }

      // Build update object
      const updateData = {
        name: sanitizeString(name),
        price: parseFloat(price),
        description: sanitizeString(description),
        height: height ? parseFloat(height) : null,
        width: width ? parseFloat(width) : null,
        stripePriceId: sanitizeString(stripePriceId || ''),
        status: status || 'available',
        updatedAt: new Date()
      }

      // Only update image if provided
      if (imageBase64) {
        updateData.imageBase64 = imageBase64
        updateData.imageFilename = sanitizeString(imageFilename || existingProduct.imageFilename)
      }

      // Update in MongoDB
      await productsCollection.updateOne(
        { id: productId },
        { $set: updateData }
      )

      return res.status(200).json(
        apiResponse(true, {
          product: {
            id: productId,
            ...updateData
          }
        }, 'Produit modifié avec succès')
      )
    } catch (error) {
      console.error('Update product error:', error)
      return res.status(500).json(
        apiResponse(false, null, 'Erreur lors de la modification du produit')
      )
    }
  }

  // DELETE - Delete product
  if (req.method === 'DELETE') {
    try {
      const result = await productsCollection.deleteOne({ id: productId })

      if (result.deletedCount === 0) {
        return res.status(404).json(apiResponse(false, null, 'Produit non trouvé'))
      }

      return res.status(200).json(
        apiResponse(true, { id: productId }, 'Produit supprimé avec succès')
      )
    } catch (error) {
      console.error('Delete product error:', error)
      return res.status(500).json(
        apiResponse(false, null, 'Erreur lors de la suppression du produit')
      )
    }
  }

  return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
}

// Wrapper to require auth only for PUT and DELETE
async function handlerWithConditionalAuth(req, res) {
  // GET is public, no auth required
  if (req.method === 'GET') {
    return handler(req, res)
  }

  // PUT and DELETE require auth
  const authHandler = requireAuth(handler)
  return authHandler(req, res)
}

export default handlerWithConditionalAuth

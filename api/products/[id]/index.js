import { getCollection } from '../../_lib/mongodb.js'
import { requireAuth } from '../../_lib/auth.js'
import { handleCorsOptions, apiResponse, validateProduct, sanitizeString } from '../../_lib/utils.js'
import { deleteImage } from '../../_lib/cloudinary.js'

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

      // Support both Cloudinary URLs (imageUrl) and legacy base64 (imageBase64)
      return res.status(200).json(
        apiResponse(true, {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            height: product.height,
            width: product.width,
            image: product.imageUrl || product.imageBase64,
            imageUrl: product.imageUrl || null,
            imagePublicId: product.imagePublicId || null,
            imageFilename: product.imageFilename,
            stripePriceId: product.stripePriceId,
            status: product.status,
            collectionId: product.collectionId,
            technique: product.technique,
            year: product.year,
            framed: product.framed
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
      const { name, price, description, height, width, imageUrl, imagePublicId, imageFilename, stripePriceId, status, collectionId, technique, year, framed } = req.body

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

      // Build update object
      const updateData = {
        name: sanitizeString(name),
        price: parseFloat(price),
        description: sanitizeString(description),
        height: height ? parseFloat(height) : null,
        width: width ? parseFloat(width) : null,
        stripePriceId: sanitizeString(stripePriceId || ''),
        status: status || 'available',
        collectionId: collectionId || null,
        technique: technique || 'broderie-photo',
        year: year ? parseInt(year) : null,
        framed: framed || 'non',
        updatedAt: new Date()
      }

      // Only update image if new URL provided
      if (imageUrl) {
        // Delete old image from Cloudinary if it exists
        if (existingProduct.imagePublicId) {
          await deleteImage(existingProduct.imagePublicId)
        }
        updateData.imageUrl = imageUrl
        updateData.imagePublicId = imagePublicId || null
        updateData.imageFilename = sanitizeString(imageFilename || existingProduct.imageFilename)
        // Remove old base64 if migrating to Cloudinary
        updateData.imageBase64 = null
      }

      // Update in MongoDB
      await productsCollection.updateOne(
        { id: productId },
        { $set: updateData }
      )

      // Fetch updated product for response
      const updatedProduct = await productsCollection.findOne({ id: productId })

      return res.status(200).json(
        apiResponse(true, {
          product: {
            id: productId,
            name: updatedProduct.name,
            price: updatedProduct.price,
            description: updatedProduct.description,
            height: updatedProduct.height,
            width: updatedProduct.width,
            image: updatedProduct.imageUrl || updatedProduct.imageBase64,
            imageUrl: updatedProduct.imageUrl || null,
            imagePublicId: updatedProduct.imagePublicId || null,
            imageFilename: updatedProduct.imageFilename,
            stripePriceId: updatedProduct.stripePriceId,
            status: updatedProduct.status,
            collectionId: updatedProduct.collectionId,
            technique: updatedProduct.technique,
            year: updatedProduct.year,
            framed: updatedProduct.framed
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
      // Find product first to get image public ID
      const product = await productsCollection.findOne({ id: productId })

      if (!product) {
        return res.status(404).json(apiResponse(false, null, 'Produit non trouvé'))
      }

      // Delete image from Cloudinary if it exists
      if (product.imagePublicId) {
        await deleteImage(product.imagePublicId)
      }

      // Delete from MongoDB
      await productsCollection.deleteOne({ id: productId })

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

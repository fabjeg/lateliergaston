import { getCollection } from '../_lib/mongodb.js'
import { requireAuth } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse, validateProduct, sanitizeString } from '../_lib/utils.js'

async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const { name, price, description, height, width, imageUrl, imagePublicId, imageFilename, stripePriceId, status, collectionId, technique, year, framed } = req.body

    // Validate product data
    const productValidation = validateProduct({ name, price, description, status })
    if (!productValidation.valid) {
      return res.status(400).json(
        apiResponse(false, null, productValidation.errors.join(', '))
      )
    }

    // Validate image URL is provided (from Cloudinary upload)
    if (!imageUrl) {
      return res.status(400).json(apiResponse(false, null, 'URL de l\'image requise (uploadez d\'abord via /api/upload)'))
    }

    // Basic URL validation
    if (!imageUrl.startsWith('https://')) {
      return res.status(400).json(apiResponse(false, null, 'URL de l\'image invalide'))
    }

    const productsCollection = await getCollection('products')

    // Get next ID
    const lastProduct = await productsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray()

    const nextId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1

    // Create product document with Cloudinary URL
    const product = {
      id: nextId,
      name: sanitizeString(name),
      price: parseFloat(price),
      description: sanitizeString(description),
      height: height ? parseFloat(height) : null,
      width: width ? parseFloat(width) : null,
      imageUrl, // Cloudinary URL
      imagePublicId: imagePublicId || null, // Cloudinary public ID for deletion
      imageFilename: sanitizeString(imageFilename || `product-${nextId}.webp`),
      stripePriceId: sanitizeString(stripePriceId || ''),
      status: status || 'available',
      collectionId: collectionId || null,
      technique: technique || 'broderie-photo',
      year: year ? parseInt(year) : null,
      framed: framed || 'non',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert into MongoDB
    await productsCollection.insertOne(product)

    return res.status(201).json(
      apiResponse(true, {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          height: product.height,
          width: product.width,
          image: product.imageUrl,
          imageUrl: product.imageUrl,
          imagePublicId: product.imagePublicId,
          imageFilename: product.imageFilename,
          stripePriceId: product.stripePriceId,
          status: product.status,
          collectionId: product.collectionId,
          technique: product.technique,
          year: product.year,
          framed: product.framed
        }
      }, 'Produit créé avec succès')
    )
  } catch (error) {
    console.error('Create product error:', error)
    return res.status(500).json(
      apiResponse(false, null, 'Erreur lors de la création du produit')
    )
  }
}

export default requireAuth(handler)

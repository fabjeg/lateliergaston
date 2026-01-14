import { getCollection } from '../_lib/mongodb.js'
import { requireAuth } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse, validateProduct, validateImageBase64, sanitizeString } from '../_lib/utils.js'

async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  try {
    const { name, price, description, height, width, imageBase64, imageFilename, stripePriceId, status } = req.body

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
    } else {
      return res.status(400).json(apiResponse(false, null, 'Image requise'))
    }

    const productsCollection = await getCollection('products')

    // Get next ID
    const lastProduct = await productsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray()

    const nextId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1

    // Create product document
    const product = {
      id: nextId,
      name: sanitizeString(name),
      price: parseFloat(price),
      description: sanitizeString(description),
      height: height ? parseFloat(height) : null,
      width: width ? parseFloat(width) : null,
      imageBase64,
      imageFilename: sanitizeString(imageFilename || `product-${nextId}.webp`),
      stripePriceId: sanitizeString(stripePriceId || ''),
      status: status || 'available',
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
          imageFilename: product.imageFilename,
          stripePriceId: product.stripePriceId,
          status: product.status
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

import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse, validateProduct, sanitizeString } from '../_lib/utils.js'
import { verifySession } from '../_lib/auth.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  switch (req.method) {
    case 'GET':
      return getProducts(req, res)
    case 'POST':
      return withAuth(req, res, createProduct)
    case 'PATCH':
      return withAuth(req, res, reorderProducts)
    default:
      return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }
}

async function withAuth(req, res, fn) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionId = cookies.admin_session
  const admin = await verifySession(sessionId)

  if (!admin) {
    return res.status(401).json({ success: false, error: 'Non autorisé. Veuillez vous connecter.' })
  }

  req.admin = admin
  return fn(req, res)
}

// ── GET  /api/products ───────────────────────────────

async function getProducts(req, res) {
  try {
    const productsCollection = await getCollection('products')

    const includeHidden = req.query.includeHidden === 'true'
    let isAdmin = false

    if (includeHidden) {
      const cookies = cookie.parse(req.headers.cookie || '')
      const sessionId = cookies.admin_session
      const admin = await verifySession(sessionId)
      isAdmin = !!admin
    }

    const query = (includeHidden && isAdmin)
      ? {}
      : { status: { $ne: 'hidden' } }

    const products = await productsCollection
      .find(query)
      .sort({ displayOrder: 1, id: 1 })
      .toArray()

    const transformedProducts = products.map(product => ({
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
      technique: product.technique,
      year: product.year,
      framed: product.framed,
      collectionId: product.collectionId,
      displayOrder: product.displayOrder ?? product.id
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

// ── POST  /api/products ──────────────────────────────

async function createProduct(req, res) {
  try {
    const { name, price, description, height, width, imageUrl, imagePublicId, imageFilename, stripePriceId, status, collectionId, technique, year, framed } = req.body

    const productValidation = validateProduct({ name, price, description, status })
    if (!productValidation.valid) {
      return res.status(400).json(
        apiResponse(false, null, productValidation.errors.join(', '))
      )
    }

    if (!imageUrl) {
      return res.status(400).json(apiResponse(false, null, 'URL de l\'image requise (uploadez d\'abord via /api/upload)'))
    }

    if (!imageUrl.startsWith('https://')) {
      return res.status(400).json(apiResponse(false, null, 'URL de l\'image invalide'))
    }

    const productsCollection = await getCollection('products')

    const lastProduct = await productsCollection
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray()

    const nextId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1

    const product = {
      id: nextId,
      name: sanitizeString(name),
      price: parseFloat(price),
      description: sanitizeString(description),
      height: height ? parseFloat(height) : null,
      width: width ? parseFloat(width) : null,
      imageUrl,
      imagePublicId: imagePublicId || null,
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

// ── PATCH  /api/products ─────────────────────────────

async function reorderProducts(req, res) {
  try {
    const { orderedIds } = req.body

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json(
        apiResponse(false, null, 'Liste des IDs requise')
      )
    }

    const productsCollection = await getCollection('products')

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

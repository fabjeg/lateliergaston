import { getCollection } from '../_lib/mongodb.js'
import { verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse, sanitizeString, isValidEmail } from '../_lib/utils.js'
import { uploadImage } from '../_lib/cloudinary.js'
import { v4 as uuidv4 } from 'uuid'
import cookie from 'cookie'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  if (req.method === 'GET') {
    // Admin only: récupérer toutes les demandes
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session
    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(apiResponse(false, null, 'Non autorise'))
    }

    return getCustomOrders(req, res)
  }

  if (req.method === 'POST') {
    // Public: créer une nouvelle demande
    return createCustomOrder(req, res)
  }

  return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
}

async function getCustomOrders(req, res) {
  try {
    const collection = await getCollection('custom_orders')
    const orders = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return res.status(200).json(apiResponse(true, { orders }))
  } catch (error) {
    console.error('Error fetching custom orders:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

async function createCustomOrder(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      photoOption,
      selectedPhotoId,
      selectedPhotoUrl,
      uploadedPhotoBase64,
      materiau,
      taille,
      papier,
      cadre,
      description
    } = req.body

    // Validation
    const errors = []

    if (!customerName || customerName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères')
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      errors.push('Email invalide')
    }

    if (!materiau) {
      errors.push('Veuillez choisir un matériau')
    }

    if (!taille) {
      errors.push('Veuillez choisir une taille')
    }

    if (!papier) {
      errors.push('Veuillez choisir un type de papier')
    }

    if (!description || description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères')
    }

    if (photoOption === 'gallery' && !selectedPhotoId) {
      errors.push('Veuillez sélectionner une photo de la galerie')
    }

    if (photoOption === 'upload' && !uploadedPhotoBase64) {
      errors.push('Veuillez télécharger votre photo')
    }

    if (errors.length > 0) {
      return res.status(400).json(apiResponse(false, null, errors.join(', ')))
    }

    // Upload photo to Cloudinary if provided
    let uploadedPhotoUrl = null
    if (photoOption === 'upload' && uploadedPhotoBase64) {
      try {
        const cloudinaryResult = await uploadImage(uploadedPhotoBase64, {
          folder: 'lateliergaston/custom-orders'
        })
        if (cloudinaryResult.success) {
          uploadedPhotoUrl = cloudinaryResult.url
        }
      } catch (err) {
        console.error('Cloudinary upload failed, falling back to base64:', err)
      }
    }

    // Préparer les données
    const collection = await getCollection('custom_orders')

    const order = {
      id: uuidv4(),
      customerName: sanitizeString(customerName),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? sanitizeString(customerPhone) : null,
      photoOption,
      selectedPhotoId: photoOption === 'gallery' ? selectedPhotoId : null,
      selectedPhotoUrl: photoOption === 'gallery' ? selectedPhotoUrl : null,
      uploadedPhoto: uploadedPhotoUrl || (photoOption === 'upload' ? uploadedPhotoBase64 : null),
      materiau,
      taille: taille || null,
      papier,
      cadre: Boolean(cadre),
      description: sanitizeString(description),
      status: 'pending', // pending, in_progress, completed, cancelled
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await collection.insertOne(order)

    return res.status(201).json(apiResponse(true, { order: { id: order.id, uploadedPhotoUrl } }, 'Demande créée avec succès'))
  } catch (error) {
    console.error('Error creating custom order:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

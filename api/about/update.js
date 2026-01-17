import { getCollection } from '../_lib/mongodb.js'
import { handleCorsOptions, apiResponse, verifyAdminSession } from '../_lib/utils.js'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  // Only allow PUT
  if (req.method !== 'PUT') {
    return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
  }

  // Verify admin session
  const admin = await verifyAdminSession(req)
  if (!admin) {
    return res.status(401).json(apiResponse(false, null, 'Non autorisé'))
  }

  try {
    const {
      heroTitle,
      heroText1,
      heroText2,
      section1Title,
      section1Text,
      section2Title,
      section2Text,
      section3Title,
      values
    } = req.body

    const aboutCollection = await getCollection('about')

    const content = {
      _id: 'main',
      heroTitle,
      heroText1,
      heroText2,
      section1Title,
      section1Text,
      section2Title,
      section2Text,
      section3Title,
      values,
      updatedAt: new Date(),
      updatedBy: admin.username
    }

    await aboutCollection.replaceOne(
      { _id: 'main' },
      content,
      { upsert: true }
    )

    return res.status(200).json(apiResponse(true, { content }, 'Contenu mis à jour'))
  } catch (error) {
    console.error('Error updating about content:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

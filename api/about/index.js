import { getCollection } from '../_lib/mongodb.js'
import { requireAuth, verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  if (req.method === 'GET') {
    return getAboutContent(req, res)
  }

  if (req.method === 'PUT') {
    // Verify auth for PUT
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session
    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(apiResponse(false, null, 'Non autorisé'))
    }

    req.admin = admin
    return updateAboutContent(req, res)
  }

  return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
}

async function getAboutContent(req, res) {
  try {
    const aboutCollection = await getCollection('about')
    let content = await aboutCollection.findOne({ _id: 'main' })

    // Si pas de contenu, retourner le contenu par défaut
    if (!content) {
      content = getDefaultContent()
    }

    return res.status(200).json(apiResponse(true, { content }))
  } catch (error) {
    console.error('Error fetching about content:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

async function updateAboutContent(req, res) {
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
      updatedBy: req.admin?.username || 'admin'
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

function getDefaultContent() {
  return {
    _id: 'main',
    heroTitle: "L'art de la broderie contemporaine",
    heroText1: "L'Atelier Gaston est né de la passion pour l'artisanat et la création unique. Chaque œuvre est une fusion entre photographie et broderie, créant des pièces uniques qui racontent une histoire.",
    heroText2: "Nous croyons en la valeur du fait-main et en l'importance de préserver les techniques artisanales traditionnelles tout en y apportant une touche contemporaine et artistique.",
    section1Title: "Notre histoire",
    section1Text: "L'Atelier Gaston est né de la passion pour l'artisanat et la création unique. Depuis ses débuts, notre atelier s'engage à produire des pièces de qualité, fabriquées avec soin et attention aux détails.",
    section2Title: "Notre mission",
    section2Text: "Nous croyons en la valeur du fait-main et en l'importance de préserver les techniques artisanales traditionnelles. Chaque produit est une œuvre d'art en soi, conçue pour durer et apporter de la joie à son propriétaire.",
    section3Title: "Nos valeurs",
    values: [
      "Qualité artisanale",
      "Matériaux durables et éthiques",
      "Créativité et innovation",
      "Satisfaction client"
    ]
  }
}

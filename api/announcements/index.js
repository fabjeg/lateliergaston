import { getCollection } from '../_lib/mongodb.js'
import { verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCorsOptions(req, res)) return

  if (req.method === 'GET') {
    return getAnnouncements(req, res)
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
    return updateAnnouncements(req, res)
  }

  return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
}

async function getAnnouncements(req, res) {
  try {
    const announcementsCollection = await getCollection('announcements')
    let content = await announcementsCollection.findOne({ _id: 'main' })

    // Si pas de contenu, retourner le contenu par défaut
    if (!content) {
      content = getDefaultContent()
    }

    return res.status(200).json(apiResponse(true, { content }))
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

async function updateAnnouncements(req, res) {
  try {
    const {
      heroTitle,
      heroSubtitle,
      announcement,
      featuredTitle,
      featuredProductIds,
      artSection,
      sectionsOrder,
      customBlocks
    } = req.body

    // Validate customBlocks
    const validTypes = ['cards', 'carousel', 'text']
    const validatedBlocks = Array.isArray(customBlocks)
      ? customBlocks.filter(b => b && b.id && validTypes.includes(b.type))
      : []

    const announcementsCollection = await getCollection('announcements')

    const content = {
      _id: 'main',
      heroTitle,
      heroSubtitle,
      announcement,
      featuredTitle,
      featuredProductIds,
      artSection,
      sectionsOrder,
      customBlocks: validatedBlocks,
      updatedAt: new Date(),
      updatedBy: req.admin?.username || 'admin'
    }

    await announcementsCollection.replaceOne(
      { _id: 'main' },
      content,
      { upsert: true }
    )

    return res.status(200).json(apiResponse(true, { content }, 'Contenu mis à jour'))
  } catch (error) {
    console.error('Error updating announcements:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

function getDefaultContent() {
  return {
    _id: 'main',
    heroTitle: 'Bienvenue à L\'Atelier Gaston',
    heroSubtitle: 'Découvrez nos créations uniques alliant photographie et broderie artisanale',
    announcement: {
      active: true,
      title: 'Nouvelle Collection',
      text: 'Découvrez notre nouvelle collection de portraits brodés',
      link: '/shop',
      linkText: 'Voir la collection'
    },
    featuredTitle: 'Nos créations à la une',
    featuredProductIds: [],
    artSection: {
      active: true,
      title: '',
      text: '',
      images: []
    },
    sectionsOrder: ['hero', 'announcement', 'featured', 'art', 'cta'],
    customBlocks: []
  }
}

import { getCollection } from '../_lib/mongodb.js'
import { verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method === 'GET') {
    return getSurmesureConfig(req, res)
  }

  if (req.method === 'PUT') {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session
    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(apiResponse(false, null, 'Non autorisé'))
    }

    req.admin = admin
    return updateSurmesureConfig(req, res)
  }

  return res.status(405).json(apiResponse(false, null, 'Méthode non autorisée'))
}

async function getSurmesureConfig(req, res) {
  try {
    const collection = await getCollection('surmesure')
    let config = await collection.findOne({ _id: 'main' })

    if (!config) {
      config = getDefaultConfig()
    }

    return res.status(200).json(apiResponse(true, { config }))
  } catch (error) {
    console.error('Error fetching surmesure config:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

async function updateSurmesureConfig(req, res) {
  try {
    const { materiaux, tailles, papiers, cadreConfig, descriptionPlaceholder } = req.body

    if (!Array.isArray(materiaux)) {
      return res.status(400).json(apiResponse(false, null, 'Format invalide'))
    }

    const collection = await getCollection('surmesure')

    const config = {
      _id: 'main',
      materiaux,
      tailles: Array.isArray(tailles) ? tailles : [],
      papiers: Array.isArray(papiers) ? papiers : [],
      cadreConfig: cadreConfig && typeof cadreConfig === 'object' ? cadreConfig : { enabled: true, note: '' },
      descriptionPlaceholder: typeof descriptionPlaceholder === 'string' ? descriptionPlaceholder : '',
      updatedAt: new Date(),
      updatedBy: req.admin?.username || 'admin'
    }

    await collection.replaceOne(
      { _id: 'main' },
      config,
      { upsert: true }
    )

    return res.status(200).json(apiResponse(true, { config }, 'Configuration mise à jour'))
  } catch (error) {
    console.error('Error updating surmesure config:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

function getDefaultConfig() {
  return {
    _id: 'main',
    materiaux: [
      {
        id: 'cheveux-artificiels',
        title: 'Cheveux Artificiels',
        description: 'Fibres synthétiques de haute qualité',
        explanation: '',
        icon: 'hair'
      },
      {
        id: 'poils-animaux',
        title: "Poils d'Animaux",
        description: 'Immortalisez votre compagnon',
        explanation: '',
        icon: 'animal'
      },
      {
        id: 'cheveux-bebe',
        title: 'Cheveux de Bébé',
        description: 'Un souvenir précieux et unique',
        explanation: '',
        icon: 'baby'
      }
    ],
    tailles: ['20x30 cm', '30x40 cm', '40x50 cm'],
    papiers: [
      { id: 'papier-photo', title: 'Papier Photo', description: 'Finition brillante et détails nets', icon: 'photo' },
      { id: 'papier-art', title: "Papier d'Art", description: 'Texture noble et rendu artistique', icon: 'art' }
    ],
    cadreConfig: {
      enabled: true,
      note: "Un cadre élégant sera sélectionné pour mettre en valeur votre œuvre."
    },
    descriptionPlaceholder: "Décrivez votre vision, vos souhaits particuliers, les dimensions souhaitées, les couleurs préférées..."
  }
}

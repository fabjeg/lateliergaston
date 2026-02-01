import { getCollection } from '../_lib/mongodb.js'
import { verifySession } from '../_lib/auth.js'
import { handleCorsOptions, apiResponse } from '../_lib/utils.js'
import cookie from 'cookie'

const DEFAULTS = {
  headingColor: '#7a3540',
  subtitleColor: '#4a4a4a',
  textColor: '#1a1a1a',
  buttonBg: '#7a3540',
  buttonText: '#ffffff',
  announcementBg: '#f8f4f0',
  ctaBg: '#2c3e50'
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/

export default async function handler(req, res) {
  if (handleCorsOptions(req, res)) return

  if (req.method === 'GET') {
    return getSettings(req, res)
  }

  if (req.method === 'PUT') {
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.admin_session
    const admin = await verifySession(sessionId)

    if (!admin) {
      return res.status(401).json(apiResponse(false, null, 'Non autorise'))
    }

    req.admin = admin
    return updateSettings(req, res)
  }

  return res.status(405).json(apiResponse(false, null, 'Methode non autorisee'))
}

async function getSettings(req, res) {
  try {
    const collection = await getCollection('settings')
    let settings = await collection.findOne({ _id: 'main' })

    if (!settings) {
      settings = { _id: 'main', ...DEFAULTS }
    }

    return res.status(200).json(apiResponse(true, { settings }))
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

async function updateSettings(req, res) {
  try {
    const { headingColor, subtitleColor, textColor, buttonBg, buttonText, announcementBg, ctaBg } = req.body

    const colors = { headingColor, subtitleColor, textColor, buttonBg, buttonText, announcementBg, ctaBg }
    for (const [key, value] of Object.entries(colors)) {
      if (value && !HEX_REGEX.test(value)) {
        return res.status(400).json(apiResponse(false, null, `Couleur invalide pour ${key}: ${value}`))
      }
    }

    const collection = await getCollection('settings')

    const settings = {
      _id: 'main',
      headingColor: headingColor || DEFAULTS.headingColor,
      subtitleColor: subtitleColor || DEFAULTS.subtitleColor,
      textColor: textColor || DEFAULTS.textColor,
      buttonBg: buttonBg || DEFAULTS.buttonBg,
      buttonText: buttonText || DEFAULTS.buttonText,
      announcementBg: announcementBg || DEFAULTS.announcementBg,
      ctaBg: ctaBg || DEFAULTS.ctaBg,
      updatedAt: new Date(),
      updatedBy: req.admin?.username || 'admin'
    }

    await collection.replaceOne(
      { _id: 'main' },
      settings,
      { upsert: true }
    )

    return res.status(200).json(apiResponse(true, { settings }, 'Couleurs mises a jour'))
  } catch (error) {
    console.error('Error updating settings:', error)
    return res.status(500).json(apiResponse(false, null, 'Erreur serveur'))
  }
}

const API_URL = import.meta.env.VITE_API_URL || ''

let settingsCache = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getSettings(forceRefresh = false) {
  if (!forceRefresh && settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache
  }

  try {
    const response = await fetch(`${API_URL}/api/settings`)
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }
    const data = await response.json()

    if (data.success) {
      const result = { success: true, settings: data.data.settings }
      settingsCache = result
      cacheTimestamp = Date.now()
      return result
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error fetching settings:', error)
    if (settingsCache) return settingsCache
    return { success: false, error: 'Erreur de connexion' }
  }
}

export function invalidateSettingsCache() {
  settingsCache = null
  cacheTimestamp = 0
}

export async function updateSettings(settings) {
  try {
    const response = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(settings)
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()

    if (data.success) {
      invalidateSettingsCache()
      return { success: true, settings: data.data.settings }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

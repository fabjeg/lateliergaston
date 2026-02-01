const API_URL = import.meta.env.VITE_API_URL || ''

export async function getSettings() {
  try {
    const response = await fetch(`${API_URL}/api/settings`)
    const data = await response.json()

    if (data.success) {
      return { success: true, settings: data.data.settings }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
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

    const data = await response.json()

    if (data.success) {
      return { success: true, settings: data.data.settings }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

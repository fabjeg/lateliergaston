const API_URL = import.meta.env.VITE_API_URL || ''

export async function getSurmesureConfig() {
  try {
    const response = await fetch(`${API_URL}/api/surmesure`)
    const data = await response.json()

    if (data.success) {
      return { success: true, config: data.data.config }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error fetching surmesure config:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

export async function updateSurmesureConfig(config) {
  try {
    const response = await fetch(`${API_URL}/api/surmesure`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(config)
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, config: data.data.config }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error updating surmesure config:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

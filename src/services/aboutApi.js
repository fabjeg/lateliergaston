const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Récupérer le contenu de la page À propos
 */
export async function getAboutContent() {
  try {
    const response = await fetch(`${API_URL}/api/about`)
    const data = await response.json()

    if (data.success) {
      return { success: true, content: data.data.content }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error fetching about content:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Mettre à jour le contenu de la page À propos
 */
export async function updateAboutContent(content) {
  try {
    const response = await fetch(`${API_URL}/api/about/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(content)
    })

    const data = await response.json()

    if (data.success) {
      return { success: true, content: data.data.content }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error updating about content:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

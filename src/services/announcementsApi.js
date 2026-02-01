const API_URL = import.meta.env.VITE_API_URL || ''

/**
 * Récupérer le contenu de la page Accueil (annonces)
 */
export async function getAnnouncementsContent() {
  try {
    const response = await fetch(`${API_URL}/api/announcements`)
    const data = await response.json()

    if (data.success) {
      return { success: true, content: data.data.content }
    }
    return { success: false, error: data.message }
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

/**
 * Mettre à jour le contenu de la page Accueil (annonces)
 */
export async function updateAnnouncementsContent(content) {
  try {
    const response = await fetch(`${API_URL}/api/announcements`, {
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
    console.error('Error updating announcements:', error)
    return { success: false, error: 'Erreur de connexion' }
  }
}

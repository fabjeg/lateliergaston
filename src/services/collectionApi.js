/**
 * API service for collection management
 * Stockage local pour l'instant (localStorage)
 */

const STORAGE_KEY = 'atelier_gaston_collections'

// Collections par défaut
const defaultCollections = [
  { id: '1', name: 'Portraits', description: 'Portraits et visages' },
  { id: '2', name: 'Animaux', description: 'Nos amis les bêtes' },
  { id: '3', name: 'Paysages', description: 'Nature et paysages' },
  { id: '4', name: 'Abstraits', description: 'Créations abstraites' },
]

/**
 * Initialiser les collections si vide
 */
function initCollections() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCollections))
  }
}

/**
 * Get all collections
 */
export function getAllCollections() {
  try {
    initCollections()
    const collections = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    return { success: true, collections }
  } catch (error) {
    console.error('Get collections error:', error)
    return { success: false, error: 'Erreur lors du chargement des collections' }
  }
}

/**
 * Create new collection
 */
export function createCollection(collectionData) {
  try {
    const collections = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    const newCollection = {
      id: Date.now().toString(),
      name: collectionData.name,
      description: collectionData.description || ''
    }
    collections.push(newCollection)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
    return { success: true, collection: newCollection }
  } catch (error) {
    console.error('Create collection error:', error)
    return { success: false, error: 'Erreur lors de la création' }
  }
}

/**
 * Update collection
 */
export function updateCollection(id, collectionData) {
  try {
    const collections = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    const index = collections.findIndex(c => c.id === id)
    if (index === -1) {
      return { success: false, error: 'Collection non trouvée' }
    }
    collections[index] = { ...collections[index], ...collectionData }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
    return { success: true, collection: collections[index] }
  } catch (error) {
    console.error('Update collection error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Delete collection
 */
export function deleteCollection(id) {
  try {
    const collections = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    const filtered = collections.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return { success: true, id }
  } catch (error) {
    console.error('Delete collection error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

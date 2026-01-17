import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { getAllCollections, createCollection, updateCollection, deleteCollection } from '../../services/collectionApi'
import BackButton from '../../components/BackButton'
import './AdminCollections.css'

function AdminCollections() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Formulaire
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = () => {
    setLoading(true)
    const result = getAllCollections()
    if (result.success) {
      setCollections(result.collections)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return
    }

    let result
    if (editingId) {
      result = updateCollection(editingId, formData)
    } else {
      result = createCollection(formData)
    }

    if (result.success) {
      loadCollections()
      resetForm()
    } else {
      setError(result.error)
    }
  }

  const handleEdit = (collection) => {
    setEditingId(collection.id)
    setFormData({ name: collection.name, description: collection.description || '' })
    setShowForm(true)
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Supprimer la collection "${name}" ?`)) return

    const result = deleteCollection(id)
    if (result.success) {
      loadCollections()
    } else {
      setError(result.error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', description: '' })
    setError('')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Gestion des Collections</h1>
          <div className="admin-user-info">
            <span>Connecté en tant que: <strong>{admin?.username}</strong></span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
        <div className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/products">Œuvres</Link>
          <Link to="/">Accueil</Link>
          <Link to="/gallery">Galerie</Link>
        </div>
      </div>

      <div className="admin-content">
        <BackButton to="/admin/dashboard" label="Dashboard" />

        <div className="collections-header">
          <h2>Collections ({collections.length})</h2>
          <button
            className="btn-create"
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            + Nouvelle collection
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Formulaire d'ajout/modification */}
        {showForm && (
          <div className="collection-form-container">
            <form onSubmit={handleSubmit} className="collection-form">
              <h3>{editingId ? 'Modifier la collection' : 'Nouvelle collection'}</h3>

              <div className="form-group">
                <label>Nom de la collection</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Portraits, Animaux..."
                />
              </div>

              <div className="form-group">
                <label>Description (optionnel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la collection..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="btn-save">
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des collections */}
        {loading ? (
          <p>Chargement...</p>
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <p>Aucune collection pour le moment.</p>
          </div>
        ) : (
          <div className="collections-grid">
            {collections.map((collection) => (
              <div key={collection.id} className="collection-card">
                <div className="collection-info">
                  <h3>{collection.name}</h3>
                  {collection.description && <p>{collection.description}</p>}
                </div>
                <div className="collection-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(collection)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(collection.id, collection.name)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCollections

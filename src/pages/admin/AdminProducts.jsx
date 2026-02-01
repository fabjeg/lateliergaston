import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { getAllProductsAdmin, deleteProduct, updateProduct } from '../../services/productApi'
import BackButton from '../../components/BackButton'
import ConfirmModal from '../../components/admin/ConfirmModal'
import './AdminProducts.css'

function AdminProducts() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [notification, setNotification] = useState(null)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProductsAdmin()

    if (result.success) {
      setProducts(result.products)
    } else {
      setError(result.error || 'Erreur lors du chargement des produits')
    }

    setLoading(false)
  }

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDeleteClick = (id, name) => {
    setConfirmModal({
      isOpen: true,
      productId: id,
      productName: name
    })
  }

  const handleDeleteConfirm = async () => {
    const { productId } = confirmModal
    setConfirmModal({ isOpen: false, productId: null, productName: '' })

    const result = await deleteProduct(productId)

    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== productId))
      showNotification('Produit supprimé avec succès', 'success')
    } else {
      showNotification(result.error || 'Erreur lors de la suppression')
    }
  }

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, productId: null, productName: '' })
  }

  const handleToggleVisibility = async (product) => {
    const newStatus = product.status === 'hidden' ? 'available' : 'hidden'

    // Envoyer toutes les données du produit avec le nouveau statut
    const productData = {
      name: product.name,
      price: product.price,
      description: product.description,
      height: product.height,
      width: product.width,
      status: newStatus
    }

    const result = await updateProduct(product.id, productData)

    if (result.success) {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: newStatus } : p
      ))
    } else {
      showNotification(result.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleToggleSold = async (product) => {
    const newStatus = product.status === 'sold' ? 'available' : 'sold'

    // Envoyer toutes les données du produit avec le nouveau statut
    const productData = {
      name: product.name,
      price: product.price,
      description: product.description,
      height: product.height,
      width: product.width,
      status: newStatus
    }

    const result = await updateProduct(product.id, productData)

    if (result.success) {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: newStatus } : p
      ))
    } else {
      showNotification(result.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const getStatusBadge = (status) => {
    const badges = {
      available: { label: 'Disponible', class: 'status-available' },
      sold: { label: 'Vendu', class: 'status-sold' },
      hidden: { label: 'Masqué', class: 'status-hidden' }
    }
    return badges[status] || badges.available
  }

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    return product.status === filter
  })

  // Compter par statut
  const counts = {
    all: products.length,
    available: products.filter(p => p.status === 'available').length,
    sold: products.filter(p => p.status === 'sold').length,
    hidden: products.filter(p => p.status === 'hidden').length
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Gestion des Œuvres</h1>
          <div className="admin-user-info">
            <span>Connecté en tant que: <strong>{admin?.username}</strong></span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
        <div className="admin-nav">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/">Accueil</Link>
          <Link to="/shop">Boutique</Link>
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div className="admin-content">
        <BackButton to="/admin/dashboard" label="Dashboard" />

        <div className="products-header">
          <h2>Œuvres ({filteredProducts.length})</h2>
          <div className="products-header-actions">
            <Link to="/admin/reorder" className="btn-reorder">
              Réorganiser
            </Link>
            <Link to="/admin/products/new" className="btn-create">
              + Nouvelle œuvre
            </Link>
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="status-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Toutes ({counts.all})
          </button>
          <button
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Disponibles ({counts.available})
          </button>
          <button
            className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
            onClick={() => setFilter('sold')}
          >
            Vendues ({counts.sold})
          </button>
          <button
            className={`filter-btn ${filter === 'hidden' ? 'active' : ''}`}
            onClick={() => setFilter('hidden')}
          >
            Masquées ({counts.hidden})
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Chargement des produits...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' ? (
              <>
                <p>Aucune œuvre pour le moment.</p>
                <Link to="/admin/products/new" className="btn-create">
                  Créer la première œuvre
                </Link>
              </>
            ) : (
              <p>Aucune œuvre avec ce statut.</p>
            )}
          </div>
        ) : (
          <>
            {/* Table pour desktop */}
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Prix</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const statusBadge = getStatusBadge(product.status)
                    return (
                      <tr key={product.id} className={product.status === 'hidden' ? 'row-hidden' : ''}>
                        <td>
                          <div className="product-thumbnail">
                            <img src={product.image} alt={product.name} />
                          </div>
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                        </td>
                        <td>{product.price.toFixed(2)} €</td>
                        <td>
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleToggleVisibility(product)}
                              className={`btn-toggle ${product.status === 'hidden' ? 'btn-show' : 'btn-hide'}`}
                              title={product.status === 'hidden' ? 'Rendre visible' : 'Masquer'}
                            >
                              {product.status === 'hidden' ? '👁️' : '🙈'}
                            </button>
                            {product.status !== 'hidden' && (
                              <button
                                onClick={() => handleToggleSold(product)}
                                className={`btn-toggle ${product.status === 'sold' ? 'btn-unsold' : 'btn-sold'}`}
                                title={product.status === 'sold' ? 'Marquer disponible' : 'Marquer vendu'}
                              >
                                {product.status === 'sold' ? '🔄' : '✓'}
                              </button>
                            )}
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="btn-edit"
                            >
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              className="btn-delete"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Cartes pour mobile */}
            <div className="products-cards">
              {filteredProducts.map((product) => {
                const statusBadge = getStatusBadge(product.status)
                return (
                  <div
                    key={product.id}
                    className={`product-card-admin ${product.status === 'hidden' ? 'card-hidden' : ''}`}
                  >
                    <div className="card-content">
                      <div className="card-image">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="card-info">
                        <h3>{product.name}</h3>
                        <p className="card-price">{product.price.toFixed(2)} €</p>
                        <div className="card-status">
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleToggleVisibility(product)}
                        className={`btn-toggle ${product.status === 'hidden' ? 'btn-show' : 'btn-hide'}`}
                      >
                        {product.status === 'hidden' ? '👁️' : '🙈'}
                      </button>
                      {product.status !== 'hidden' ? (
                        <button
                          onClick={() => handleToggleSold(product)}
                          className={`btn-toggle ${product.status === 'sold' ? 'btn-unsold' : 'btn-sold'}`}
                        >
                          {product.status === 'sold' ? '🔄' : '✓'}
                        </button>
                      ) : (
                        <div></div>
                      )}
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="btn-edit"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        className="btn-delete"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Supprimer cette oeuvre ?"
        message={`Êtes-vous sûr de vouloir supprimer "${confirmModal.productName}" ? Cette action est irréversible.`}
        confirmText="Oui, supprimer"
        cancelText="Non, annuler"
        type="danger"
      />

      {/* Notification */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}

export default AdminProducts

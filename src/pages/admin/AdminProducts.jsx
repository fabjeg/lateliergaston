import { useState, useEffect, useMemo } from 'react'
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
  const [search, setSearch] = useState('')
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

  // Compter par statut
  const counts = {
    all: products.length,
    available: products.filter(p => p.status === 'available').length,
    sold: products.filter(p => p.status === 'sold').length,
    hidden: products.filter(p => p.status === 'hidden').length
  }

  // Filtrer + rechercher
  const filteredProducts = useMemo(() => {
    let result = products
    if (filter !== 'all') {
      result = result.filter(p => p.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        return name.includes(q)
      })
    }
    return result
  }, [products, filter, search])

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

        {/* Stats rapides */}
        <div className="ap-stats-row">
          <div className="ap-stat">
            <span className="ap-stat-number">{counts.all}</span>
            <span className="ap-stat-label">Total</span>
          </div>
          <div className="ap-stat ap-stat-green">
            <span className="ap-stat-number">{counts.available}</span>
            <span className="ap-stat-label">Disponibles</span>
          </div>
          <div className="ap-stat ap-stat-red">
            <span className="ap-stat-number">{counts.sold}</span>
            <span className="ap-stat-label">Vendues</span>
          </div>
          <div className="ap-stat ap-stat-gray">
            <span className="ap-stat-number">{counts.hidden}</span>
            <span className="ap-stat-label">Masquées</span>
          </div>
        </div>

        {/* Barre d'actions */}
        <div className="ap-toolbar">
          <div className="ap-search-wrapper">
            <span className="ap-search-icon">&#x1F50D;</span>
            <input
              type="text"
              className="ap-search-input"
              placeholder="Rechercher une oeuvre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ap-search-clear" onClick={() => setSearch('')}>&#x2715;</button>
            )}
          </div>
          <div className="ap-toolbar-actions">
            <Link to="/admin/reorder" className="ap-btn ap-btn-outline">
              Réorganiser
            </Link>
            <Link to="/admin/products/new" className="ap-btn ap-btn-primary">
              + Nouvelle œuvre
            </Link>
          </div>
        </div>

        {/* Filtres par statut */}
        <div className="ap-filters">
          {[
            { key: 'all', label: 'Toutes', count: counts.all },
            { key: 'available', label: 'Disponibles', count: counts.available },
            { key: 'sold', label: 'Vendues', count: counts.sold },
            { key: 'hidden', label: 'Masquées', count: counts.hidden }
          ].map(f => (
            <button
              key={f.key}
              className={`ap-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="ap-filter-count">{f.count}</span>
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="ap-loading">
            <div className="ap-loading-spinner" />
            <p>Chargement des oeuvres...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="ap-empty">
            {filter === 'all' && !search ? (
              <>
                <div className="ap-empty-icon">&#x1F3A8;</div>
                <p>Aucune oeuvre pour le moment</p>
                <Link to="/admin/products/new" className="ap-btn ap-btn-primary">
                  Créer la première oeuvre
                </Link>
              </>
            ) : (
              <>
                <div className="ap-empty-icon">&#x1F50D;</div>
                <p>Aucune oeuvre trouvée{search ? ` pour "${search}"` : ' avec ce statut'}</p>
                {search && (
                  <button className="ap-btn ap-btn-outline" onClick={() => setSearch('')}>
                    Effacer la recherche
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <p className="ap-result-count">
              {filteredProducts.length} oeuvre{filteredProducts.length !== 1 ? 's' : ''}
              {search && <> pour "<strong>{search}</strong>"</>}
            </p>

            {/* Table pour desktop */}
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th></th>
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
                      <tr key={product.id} className={product.status === 'hidden' ? 'ap-row-hidden' : ''}>
                        <td>
                          <div className="ap-thumb">
                            <img src={product.image} alt={product.name} />
                          </div>
                        </td>
                        <td>
                          <span className="ap-product-name">{product.name}</span>
                        </td>
                        <td>
                          <span className="ap-price">{product.price.toFixed(2)} €</span>
                        </td>
                        <td>
                          <span className={`ap-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>
                          <div className="ap-actions">
                            <button
                              onClick={() => handleToggleVisibility(product)}
                              className={`ap-action-btn ${product.status === 'hidden' ? 'ap-act-show' : 'ap-act-hide'}`}
                              title={product.status === 'hidden' ? 'Rendre visible' : 'Masquer'}
                            >
                              {product.status === 'hidden' ? 'Afficher' : 'Masquer'}
                            </button>
                            {product.status !== 'hidden' && (
                              <button
                                onClick={() => handleToggleSold(product)}
                                className={`ap-action-btn ${product.status === 'sold' ? 'ap-act-unsold' : 'ap-act-sold'}`}
                                title={product.status === 'sold' ? 'Marquer disponible' : 'Marquer vendu'}
                              >
                                {product.status === 'sold' ? 'Disponible' : 'Vendu'}
                              </button>
                            )}
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="ap-action-btn ap-act-edit"
                            >
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              className="ap-action-btn ap-act-delete"
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
            <div className="ap-cards">
              {filteredProducts.map((product) => {
                const statusBadge = getStatusBadge(product.status)
                return (
                  <div
                    key={product.id}
                    className={`ap-card ${product.status === 'hidden' ? 'ap-card-hidden' : ''}`}
                  >
                    <div className="ap-card-top">
                      <div className="ap-card-img">
                        <img src={product.image} alt={product.name} />
                        <span className={`ap-badge ap-badge-float ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="ap-card-info">
                        <h3>{product.name}</h3>
                        <p className="ap-card-price">{product.price.toFixed(2)} €</p>
                      </div>
                    </div>
                    <div className="ap-card-actions">
                      <button
                        onClick={() => handleToggleVisibility(product)}
                        className={`ap-card-act ${product.status === 'hidden' ? 'ap-act-show' : 'ap-act-hide'}`}
                      >
                        {product.status === 'hidden' ? 'Afficher' : 'Masquer'}
                      </button>
                      {product.status !== 'hidden' && (
                        <button
                          onClick={() => handleToggleSold(product)}
                          className={`ap-card-act ${product.status === 'sold' ? 'ap-act-unsold' : 'ap-act-sold'}`}
                        >
                          {product.status === 'sold' ? 'Disponible' : 'Vendu'}
                        </button>
                      )}
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="ap-card-act ap-act-edit"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        className="ap-card-act ap-act-delete"
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

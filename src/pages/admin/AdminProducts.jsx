import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { getAllProducts, deleteProduct } from '../../services/productApi'
import './AdminProducts.css'

function AdminProducts() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProducts()

    if (result.success) {
      setProducts(result.products)
    } else {
      setError(result.error || 'Erreur lors du chargement des produits')
    }

    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?\n\nCette action est irréversible.`)) {
      return
    }

    const result = await deleteProduct(id)

    if (result.success) {
      // Remove from list
      setProducts(prev => prev.filter(p => p.id !== id))
    } else {
      alert(result.error || 'Erreur lors de la suppression')
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
      hidden: { label: 'Caché', class: 'status-hidden' }
    }
    return badges[status] || badges.available
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
        <div className="products-header">
          <h2>Œuvres ({products.length})</h2>
          <Link to="/admin/products/new" className="btn-create">
            + Créer une œuvre
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Chargement des produits...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>Aucune œuvre pour le moment.</p>
            <Link to="/admin/products/new" className="btn-create">
              Créer la première œuvre
            </Link>
          </div>
        ) : (
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
                {products.map((product) => {
                  const statusBadge = getStatusBadge(product.status)
                  return (
                    <tr key={product.id}>
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
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="btn-edit"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
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
        )}
      </div>
    </div>
  )
}

export default AdminProducts

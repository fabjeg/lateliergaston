import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useNavigate, Link } from 'react-router-dom'
import { getAllProducts } from '../../services/productApi'
import './AdminDashboard.css'

function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    hidden: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const result = await getAllProducts()

    if (result.success) {
      const products = result.products
      setStats({
        total: products.length,
        available: products.filter(p => p.status === 'available').length,
        sold: products.filter(p => p.status === 'sold').length,
        hidden: products.filter(p => p.status === 'hidden').length
      })
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Administration</h1>
          <div className="admin-user-info">
            <span>Connecté en tant que: <strong>{admin?.username}</strong></span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
        <div className="admin-nav">
          <Link to="/">Accueil</Link>
          <Link to="/shop">Boutique</Link>
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div className="admin-content">
        <div className="dashboard-welcome">
          <h2>Bienvenue dans le panneau d'administration</h2>
          <p>Vous êtes maintenant connecté au système de gestion de L'Atelier de Gaston.</p>
        </div>

        {loading ? (
          <p>Chargement des statistiques...</p>
        ) : (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total</h3>
                <p className="stat-number">{stats.total}</p>
                <p className="stat-label">œuvres totales</p>
              </div>

              <div className="stat-card">
                <h3>Disponibles</h3>
                <p className="stat-number">{stats.available}</p>
                <p className="stat-label">œuvres en vente</p>
              </div>

              <div className="stat-card">
                <h3>Vendues</h3>
                <p className="stat-number">{stats.sold}</p>
                <p className="stat-label">œuvres vendues</p>
              </div>

              <div className="stat-card">
                <h3>Cachées</h3>
                <p className="stat-number">{stats.hidden}</p>
                <p className="stat-label">œuvres masquées</p>
              </div>
            </div>

            <div className="dashboard-actions">
              <h3>Gestion des œuvres</h3>
              <p>Gérez votre catalogue d'œuvres d'art depuis le panneau d'administration.</p>
              <div className="action-links">
                <Link to="/admin/products" className="action-link">
                  📋 Voir toutes les œuvres
                </Link>
                <Link to="/admin/products/new" className="action-link">
                  ➕ Créer une nouvelle œuvre
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard

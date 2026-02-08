import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useNavigate, Link } from 'react-router-dom'
import { getAllProducts } from '../../services/productApi'
import { getSettings, updateSettings } from '../../services/settingsApi'
import './AdminDashboard.css'

const DEFAULT_SHORTCUTS = [
  {
    id: 'products',
    icon: '\uD83D\uDCCB',
    title: 'Oeuvres',
    description: 'G\u00e9rer le catalogue',
    to: '/admin/products',
  },
  {
    id: 'new-product',
    icon: '\u2795',
    title: 'Nouvelle oeuvre',
    description: 'Ajouter une cr\u00e9ation',
    to: '/admin/products/new',
  },
  {
    id: 'collections',
    icon: '\uD83C\uDFA8',
    title: 'Collections',
    description: 'Organiser la galerie',
    to: '/admin/collections',
  },
  {
    id: 'accueil',
    icon: '\uD83C\uDFE0',
    title: 'Page Accueil',
    description: 'Annonces et mise en avant',
    to: '/admin/accueil',
  },
  {
    id: 'about',
    icon: '\uD83D\uDCDD',
    title: 'Page \u00c0 propos',
    description: 'Textes et contenu',
    to: '/admin/about',
  },
  {
    id: 'colors',
    icon: '\uD83C\uDFA8',
    title: 'Couleurs',
    description: 'Personnaliser les couleurs',
    to: '/admin/colors',
  },
  {
    id: 'reorder',
    icon: '\u2195\uFE0F',
    title: 'Ordre des oeuvres',
    description: "R\u00e9ordonner l'affichage",
    to: '/admin/reorder',
  },
  {
    id: 'sur-mesure',
    icon: '\u2702\uFE0F',
    title: 'Page Sur-mesure',
    description: 'Options mat\u00e9riaux',
    to: '/admin/sur-mesure',
  },
  {
    id: 'shop-filters',
    icon: '\uD83D\uDD0D',
    title: 'Filtres Boutique',
    description: 'G\u00e9rer les filtres',
    to: '/admin/shop-filters',
  },
]

const STORAGE_KEY = 'admin_shortcuts_order'

function getSavedShortcuts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SHORTCUTS
    const order = JSON.parse(saved)
    const sorted = order
      .map(id => DEFAULT_SHORTCUTS.find(s => s.id === id))
      .filter(Boolean)
    // Ajouter les nouveaux raccourcis pas encore dans l'ordre sauvegarde
    DEFAULT_SHORTCUTS.forEach(s => {
      if (!sorted.find(x => x.id === s.id)) sorted.push(s)
    })
    return sorted
  } catch {
    return DEFAULT_SHORTCUTS
  }
}

function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    hidden: 0,
  })
  const [loading, setLoading] = useState(true)
  const [shopEnabled, setShopEnabled] = useState(true)
  const [shopToggleLoading, setShopToggleLoading] = useState(false)
  const [shortcuts, setShortcuts] = useState(getSavedShortcuts)
  const [reordering, setReordering] = useState(false)

  useEffect(() => {
    loadStats()
    loadShopStatus()
  }, [])

  const loadStats = async () => {
    const result = await getAllProducts()

    if (result.success) {
      const products = result.products
      setStats({
        total: products.length,
        available: products.filter((p) => p.status === 'available').length,
        sold: products.filter((p) => p.status === 'sold').length,
        hidden: products.filter((p) => p.status === 'hidden').length,
      })
    }

    setLoading(false)
  }

  const loadShopStatus = async () => {
    const result = await getSettings()
    if (result.success) {
      setShopEnabled(result.settings.shopEnabled !== false)
    }
  }

  const toggleShop = async () => {
    setShopToggleLoading(true)
    const newValue = !shopEnabled
    const result = await updateSettings({ shopEnabled: newValue })
    if (result.success) {
      setShopEnabled(newValue)
    }
    setShopToggleLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const moveShortcut = useCallback((index, direction) => {
    setShortcuts(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(s => s.id)))
      return next
    })
  }, [])

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Administration</h1>
          <div className="admin-header-right">
            <span className="admin-welcome">
              Bonjour, <strong>{admin?.username}</strong>
            </span>
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="shop-toggle">
          <span className="shop-toggle-label">Ventes en ligne :</span>
          <button
            className={`shop-toggle-btn ${shopEnabled ? 'shop-toggle-active' : 'shop-toggle-inactive'}`}
            onClick={toggleShop}
            disabled={shopToggleLoading}
          >
            {shopToggleLoading ? '...' : shopEnabled ? 'Activees' : 'Desactivees'}
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-icon">{'\uD83D\uDDBC\uFE0F'}</span>
            <div className="stat-info">
              <p className="stat-number">{loading ? '\u2013' : stats.total}</p>
              <p className="stat-label">oeuvres</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">{'\u2705'}</span>
            <div className="stat-info">
              <p className="stat-number">
                {loading ? '\u2013' : stats.available}
              </p>
              <p className="stat-label">disponibles</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">{'\uD83D\uDCB0'}</span>
            <div className="stat-info">
              <p className="stat-number">{loading ? '\u2013' : stats.sold}</p>
              <p className="stat-label">vendues</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">{'\uD83D\uDC41\uFE0F'}</span>
            <div className="stat-info">
              <p className="stat-number">{loading ? '\u2013' : stats.hidden}</p>
              <p className="stat-label">masquées</p>
            </div>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Raccourcis</h2>
          <button
            className={`reorder-toggle ${reordering ? 'active' : ''}`}
            onClick={() => setReordering(r => !r)}
          >
            {reordering ? 'Terminer' : 'Réorganiser'}
          </button>
        </div>
        <div className={`dashboard-grid ${reordering ? 'reordering' : ''}`}>
          {shortcuts.map((item, index) =>
            reordering ? (
              <div key={item.id} className="shortcut-card reorder-mode">
                <span className="shortcut-icon">{item.icon}</span>
                <div className="shortcut-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <div className="reorder-arrows">
                  <button
                    className="reorder-btn"
                    onClick={() => moveShortcut(index, -1)}
                    disabled={index === 0}
                    aria-label="Monter"
                  >
                    &#9650;
                  </button>
                  <button
                    className="reorder-btn"
                    onClick={() => moveShortcut(index, 1)}
                    disabled={index === shortcuts.length - 1}
                    aria-label="Descendre"
                  >
                    &#9660;
                  </button>
                </div>
              </div>
            ) : (
              <Link key={item.id} to={item.to} className="shortcut-card">
                <span className="shortcut-icon">{item.icon}</span>
                <div className="shortcut-text">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="shortcut-arrow">{'\u203A'}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

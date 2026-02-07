import { useState, useEffect, useMemo, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Shop.css'
import { getAllProducts } from '../services/productApi'
import { getAllCollections } from '../services/collectionApi'
import { useInventory } from '../context/InventoryContext'
import SoldBadge from '../components/SoldBadge'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

function Shop() {
  const { isSold } = useInventory()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filtres
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Restaurer la position de scroll au retour
  useLayoutEffect(() => {
    const savedScrollY = sessionStorage.getItem('shopScrollY')
    if (savedScrollY) {
      // Attendre que les produits soient chargés
      const timeout = setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollY))
        sessionStorage.removeItem('shopScrollY')
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Sauvegarder la position de scroll avant de naviguer
  const handleProductClick = (productId, isSoldProduct) => {
    if (isSoldProduct) return
    sessionStorage.setItem('shopScrollY', window.scrollY.toString())
    navigate(`/product/${productId}`)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProducts()

    if (result.success) {
      setProducts(result.products)
    } else {
      setError(result.error || 'Erreur lors du chargement des œuvres')
    }

    // Charger les collections
    const collectionsResult = getAllCollections()
    if (collectionsResult.success) {
      setCollections(collectionsResult.collections)
    }

    setLoading(false)
  }

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.collectionId === categoryFilter)
    }

    // Filtre par prix
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      result = result.filter(p => {
        if (max) {
          return p.price >= min && p.price <= max
        }
        return p.price >= min
      })
    }

    // Filtre par taille
    if (sizeFilter !== 'all') {
      result = result.filter(p => {
        const maxDim = Math.max(p.height || 0, p.width || 0)
        switch (sizeFilter) {
          case 'small':
            return maxDim > 0 && maxDim <= 30
          case 'medium':
            return maxDim > 30 && maxDim <= 60
          case 'large':
            return maxDim > 60
          default:
            return true
        }
      })
    }

    return result
  }, [products, categoryFilter, priceRange, sizeFilter])

  // Compter les filtres actifs
  const activeFiltersCount = [categoryFilter, priceRange, sizeFilter].filter(f => f !== 'all').length

  // Réinitialiser les filtres
  const resetFilters = () => {
    setCategoryFilter('all')
    setPriceRange('all')
    setSizeFilter('all')
  }

  if (loading) {
    return (
      <div className="shop">
        <Loader text="Chargement des œuvres" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="shop">
        <div className="loading" style={{ color: '#c33' }}>{error}</div>
      </div>
    )
  }

  return (
    <div className="shop">
      <SEO
        title="Boutique"
        description="Achetez des œuvres d'art uniques : portraits brodés avec implantation de cheveux sur photo. Pièces originales faites main, disponibles à l'achat."
        url="/shop"
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Œuvres disponibles à l'achat</h1>
      </motion.div>

      {/* Barre de filtres */}
      <motion.div
        className="shop-filters-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          className={`filters-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/>
            <line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Filtres
          {activeFiltersCount > 0 && (
            <span className="filters-count">{activeFiltersCount}</span>
          )}
        </button>

        <div className="results-count">
          {filteredProducts.length} œuvre{filteredProducts.length > 1 ? 's' : ''}
        </div>
      </motion.div>

      {/* Panneau de filtres */}
      {showFilters && (
        <motion.div
          className="shop-filters-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="filter-group">
            <label>Catégorie</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Toutes les catégories</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Prix</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="all">Tous les prix</option>
              <option value="0-50">Moins de 50 €</option>
              <option value="50-100">50 € - 100 €</option>
              <option value="100-200">100 € - 200 €</option>
              <option value="200-">Plus de 200 €</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Taille</label>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
              <option value="all">Toutes les tailles</option>
              <option value="small">Petit (≤ 30 cm)</option>
              <option value="medium">Moyen (30-60 cm)</option>
              <option value="large">Grand (&gt; 60 cm)</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button className="reset-filters" onClick={resetFilters}>
              Réinitialiser
            </button>
          )}
        </motion.div>
      )}

      {/* Grille des produits */}
      {filteredProducts.length === 0 ? (
        <div className="shop-empty">
          <p>Aucune œuvre ne correspond à vos critères.</p>
          <button onClick={resetFilters} className="btn-reset">
            Voir toutes les œuvres
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              initial={{
                opacity: 0,
                y: 80,
                scale: 0.85
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.8,
                  delay: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <div
                className={`product-card ${isSold(product.id) ? 'sold' : ''}`}
                onClick={() => handleProductClick(product.id, isSold(product.id))}
              >
                <motion.div
                  className="product-image-container"
                  initial={{ opacity: 0, scale: 1.1 }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 1,
                      delay: 0.2
                    }
                  }}
                  viewport={{ once: true }}
                >
                  <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  {isSold(product.id) && <SoldBadge />}
                </motion.div>
                <motion.div
                  className="product-info"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: 0.4
                    }
                  }}
                  viewport={{ once: true }}
                >
                  <h3>{product.name}</h3>
                  <p className="product-price">{product.price.toFixed(2)} €</p>
                  {(product.height || product.width) && (
                    <p className="product-dimensions">
                      {product.height && `${product.height} cm`}
                      {product.height && product.width && ' × '}
                      {product.width && `${product.width} cm`}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Shop

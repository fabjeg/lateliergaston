import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProducts } from '../services/productApi'
import { getAllCollections } from '../services/collectionApi'
import Loader from '../components/Loader'
import SEO from '../components/SEO'
import './Gallery.css'

function Gallery() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [priceRange, setPriceRange] = useState('all')
  const [sizeFilter, setSizeFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Read collection from URL query param
  useEffect(() => {
    const collectionParam = searchParams.get('collection')
    if (collectionParam) {
      setSelectedCollection(collectionParam)
      setExpanded(true)
    }
  }, [searchParams])

  useEffect(() => {
    loadData()
  }, [])

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedProduct(null)
      if (e.key === 'ArrowRight') navigateNext()
      if (e.key === 'ArrowLeft') navigatePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, products])

  // Filtrer les produits
  const filteredProducts = products.filter(p => {
    // Filtre par collection
    if (selectedCollection && p.collectionId !== selectedCollection) return false

    // Filtre par prix
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      if (max) {
        if (p.price < min || p.price > max) return false
      } else {
        if (p.price < min) return false
      }
    }

    // Filtre par taille
    if (sizeFilter !== 'all') {
      const maxDim = Math.max(p.height || 0, p.width || 0)
      switch (sizeFilter) {
        case 'small':
          if (maxDim <= 0 || maxDim > 30) return false
          break
        case 'medium':
          if (maxDim <= 30 || maxDim > 60) return false
          break
        case 'large':
          if (maxDim <= 60) return false
          break
      }
    }

    return true
  })

  // Navigation entre les photos (dans les produits filtrés)
  const navigateNext = () => {
    if (!selectedProduct) return
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id)
    const nextIndex = (currentIndex + 1) % filteredProducts.length
    setSelectedProduct(filteredProducts[nextIndex])
  }

  const navigatePrev = () => {
    if (!selectedProduct) return
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id)
    const prevIndex = currentIndex === 0 ? filteredProducts.length - 1 : currentIndex - 1
    setSelectedProduct(filteredProducts[prevIndex])
  }

  // Gérer le clic sur une collection
  const handleCollectionClick = (collectionId) => {
    setSelectedCollection(collectionId === selectedCollection ? null : collectionId)
    setExpanded(true) // Afficher tous les produits quand on filtre
  }

  // Compter les filtres actifs
  const activeFiltersCount = [selectedCollection, priceRange, sizeFilter].filter(f => f !== null && f !== 'all').length

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCollection(null)
    setPriceRange('all')
    setSizeFilter('all')
    setExpanded(false)
  }

  const loadData = async () => {
    setLoading(true)

    // Charger les produits
    const productsResult = await getAllProducts()
    if (productsResult.success) {
      setProducts(productsResult.products)
    }

    // Charger les collections
    const collectionsResult = getAllCollections()
    if (collectionsResult.success) {
      setCollections(collectionsResult.collections)
    }

    setLoading(false)
  }

  // Afficher 4 ou tous les produits filtrés
  const visibleProducts = expanded ? filteredProducts : filteredProducts.slice(0, 4)
  const hasMore = filteredProducts.length > 4

  if (loading) {
    return (
      <div className="gallery">
        <Loader text="Chargement de la galerie" />
      </div>
    )
  }

  return (
    <div className="gallery">
      <SEO
        title="Galerie"
        description="Explorez notre galerie de créations uniques : portraits brodés, implantation de cheveux sur photo. Chaque œuvre est une pièce unique réalisée à la main."
        url="/gallery"
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Galerie</h1>
        <p className="gallery-subtitle">Découvrez toutes nos créations</p>
      </motion.div>

      {/* Barre de filtres */}
      <motion.div
        className="gallery-filters-bar"
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

      </motion.div>

      {/* Panneau de filtres */}
      {showFilters && (
        <motion.div
          className="gallery-filters-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="filter-group">
            <label>Catégorie</label>
            <select value={selectedCollection || 'all'} onChange={(e) => {
              const val = e.target.value
              setSelectedCollection(val === 'all' ? null : val)
              if (val !== 'all') setExpanded(true)
            }}>
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

      {/* Boutons de collections */}
      <motion.div
        className="collections-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="collections-list">
          <button
            className={`collection-item ${selectedCollection === null ? 'active' : ''}`}
            onClick={() => { setSelectedCollection(null); setExpanded(false); }}
          >
            Toutes
          </button>
          {collections.map(collection => (
            <button
              key={collection.id}
              className={`collection-item ${selectedCollection === collection.id ? 'active' : ''}`}
              onClick={() => handleCollectionClick(collection.id)}
            >
              {collection.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Titre de la collection sélectionnée */}
      {selectedCollection && (
        <motion.div
          className="selected-collection-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3>
            {collections.find(c => c.id === selectedCollection)?.name}
          </h3>
        </motion.div>
      )}

      {/* Grille des créations */}
      {filteredProducts.length === 0 ? (
        <div className="gallery-empty">
          <p>Aucune œuvre dans cette collection pour le moment.</p>
        </div>
      ) : (
        <motion.div
          className="gallery-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          key={selectedCollection || 'all'}
        >
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="gallery-item"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => setSelectedProduct(product)}
            >
              <img src={product.image} alt="" />
              <div className="gallery-item-overlay">
                <h3>{product.name}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedProduct(null)}
          >
            <button
              className="lightbox-nav lightbox-prev"
              onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
            >
              ‹
            </button>

            <motion.div
              className="lightbox-content"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close"
                onClick={() => setSelectedProduct(null)}
                aria-label="Fermer"
              />
              <div className="lightbox-image">
                <motion.img
                  key={selectedProduct.id}
                  src={selectedProduct.image}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="lightbox-info">
                <h3>{selectedProduct.name}</h3>
                <div className="lightbox-ornament">✦</div>
                {selectedProduct.description && (
                  <p>{selectedProduct.description}</p>
                )}
                <div className="lightbox-details">
                  {(selectedProduct.height || selectedProduct.width) && (
                    <span className="lightbox-detail">
                      {selectedProduct.height && `${selectedProduct.height} cm`}
                      {selectedProduct.height && selectedProduct.width && ' × '}
                      {selectedProduct.width && `${selectedProduct.width} cm`}
                    </span>
                  )}
                  {selectedProduct.technique && (
                    <span className="lightbox-detail">
                      {{'broderie-photo': 'Broderie sur photographie', 'broderie-toile': 'Broderie sur toile', 'broderie-papier': 'Broderie sur papier'}[selectedProduct.technique] || selectedProduct.technique}
                    </span>
                  )}
                  {selectedProduct.year && (
                    <span className="lightbox-detail">{selectedProduct.year}</span>
                  )}
                  {selectedProduct.framed && selectedProduct.framed !== 'non' && (
                    <span className="lightbox-detail">
                      {selectedProduct.framed === 'oui' ? 'Avec cadre' : 'Cadre en option'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            <button
              className="lightbox-nav lightbox-next"
              onClick={(e) => { e.stopPropagation(); navigateNext(); }}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton voir plus */}
      {hasMore && (
        <button
          className="gallery-expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? 'Voir moins' : 'Voir plus'}</span>
          <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
        </button>
      )}
    </div>
  )
}

export default Gallery

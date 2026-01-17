import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProducts } from '../services/productApi'
import { getAllCollections } from '../services/collectionApi'
import Loader from '../components/Loader'
import './Gallery.css'

function Gallery() {
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState(null)

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

  // Filtrer les produits par collection
  const filteredProducts = selectedCollection
    ? products.filter(p => p.collectionId === selectedCollection)
    : products

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Galerie</h1>
        <p className="gallery-subtitle">Découvrez toutes nos créations</p>
      </motion.div>

      {/* Collections - Filtres */}
      <motion.div
        className="collections-filter"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
            <span className="collection-count">({filteredProducts.length} œuvre{filteredProducts.length > 1 ? 's' : ''})</span>
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
              <img src={product.image} alt={product.name} />
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
              >
                ✕
              </button>
              <div className="lightbox-image">
                <motion.img
                  key={selectedProduct.id}
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="lightbox-info">
                <h3>{selectedProduct.name}</h3>
                {selectedProduct.description && (
                  <p>{selectedProduct.description}</p>
                )}
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

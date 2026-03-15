import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ProductDetail.css'
import '../components/blocks/Blocks.css'
import { getProduct } from '../services/productApi'
import { useCart } from '../context/CartContext'
import { useInventory } from '../context/InventoryContext'
import { getOptimizedImageUrl } from '../utils/imageUrl'
import SoldBadge from '../components/SoldBadge'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

function getCardPosition(index, current, total) {
  if (total <= 1) return index === current ? 'active' : 'hidden'
  const diff = ((index - current) % total + total) % total
  if (diff === 0) return 'active'
  if (diff === 1) return 'next'
  if (diff === total - 1) return 'prev'
  if (diff === 2) return 'far-next'
  if (diff === total - 2) return 'far-prev'
  return 'hidden'
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart, isInCart } = useCart()
  const { isSold } = useInventory()
  const [showNotification, setShowNotification] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [lightbox, setLightbox] = useState(null)

  const allImages = useMemo(() => {
    if (!product) return []
    return [
      product.image,
      ...(product.images || []).map(img => img.url)
    ].filter(Boolean)
  }, [product])

  const hasMultipleImages = allImages.length > 1

  useEffect(() => {
    loadProduct()
    setSelectedImageIndex(0)
    setLightbox(null)
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    const result = await getProduct(id)

    if (result.success) {
      setProduct(result.product)
    } else {
      setError(result.error || 'Produit non trouvé')
    }

    setLoading(false)
  }

  const nextImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
  }, [allImages.length, hasMultipleImages])

  const prevImage = useCallback(() => {
    if (!hasMultipleImages) return
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }, [allImages.length, hasMultipleImages])

  // Keyboard nav in lightbox
  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((prev) => (prev + 1) % allImages.length)
      if (e.key === 'ArrowLeft') setLightbox((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, allImages.length])

  // Lock body scroll in lightbox
  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  const handleBack = () => {
    navigate(-1)
  }

  const handleCardClick = (index) => {
    if (index === selectedImageIndex) {
      setLightbox(selectedImageIndex)
    } else {
      setSelectedImageIndex(index)
    }
  }

  const lightboxPrev = () => setLightbox((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  const lightboxNext = () => setLightbox((prev) => (prev + 1) % allImages.length)

  useEffect(() => {
    if (!showNotification) return
    const timer = setTimeout(() => setShowNotification(false), 3000)
    return () => clearTimeout(timer)
  }, [showNotification])

  const handleAddToCart = () => {
    if (product && !isSold(product.id)) {
      addToCart(product, quantity)
      setShowNotification(true)
      setQuantity(1)
    }
  }

  if (loading) {
    return (
      <div className="product-detail">
        <Loader />
      </div>
    )
  }

  if (error || !product) {
    return <div className="product-detail"><h2>{error || 'Produit non trouvé'}</h2></div>
  }

  const productIsSold = isSold(product.id)

  return (
    <div className="product-detail">
      <SEO
        title={product.name}
        description={product.description || `Découvrez ${product.name} - Œuvre unique brodée par L'Atelier Gaston. Prix : ${product.price.toFixed(2)} €`}
        url={`/product/${product.id}`}
        image={product.image}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
        }}
      />
      <button className="back-to-shop" onClick={handleBack}>
        <span className="back-arrow">&#8249;</span>
        <span>Retour</span>
      </button>

      {showNotification && (
        <div className="notification">
          Produit ajouté au panier!
        </div>
      )}
      <div className={`product-detail-grid ${hasMultipleImages ? 'has-carousel' : ''}`}>
        <div className="product-image">
          {hasMultipleImages ? (
            <>
              <div className="product-carousel-container carousel-container">
                <div className="carousel-track">
                  {allImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className={`carousel-card ${getCardPosition(index, selectedImageIndex, allImages.length)}`}
                      onClick={() => handleCardClick(index)}
                    >
                      <img src={getOptimizedImageUrl(imgUrl, 600)} alt={`Photo ${index + 1}`} width="400" height="533" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
                <button className="carousel-nav carousel-prev" onClick={prevImage} aria-label="Precedent">&#8249;</button>
                <button className="carousel-nav carousel-next" onClick={nextImage} aria-label="Suivant">&#8250;</button>
              </div>
              <div className="carousel-dots">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`carousel-dot ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Photo ${idx + 1}`}
                  />
                ))}
              </div>
              {productIsSold && <div className="product-sold-overlay"><SoldBadge /></div>}
            </>
          ) : (
            <div className="product-image-wrapper" onClick={() => setLightbox(0)} style={{ cursor: 'pointer' }}>
              <img src={getOptimizedImageUrl(allImages[0], 800)} alt="" width="600" height="800" decoding="async" />
              {productIsSold && <SoldBadge />}
            </div>
          )}
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toFixed(2)} €</p>
          {(product.height || product.width) && (
            <p className="dimensions">
              Dimensions : {product.height && `${product.height} cm`}
              {product.height && product.width && ' × '}
              {product.width && `${product.width} cm`}
            </p>
          )}
          <p className="description">{product.description}</p>
          {productIsSold ? (
            <div className="sold-message">
              <p>Cette oeuvre n'est plus disponible.</p>
              <p className="sold-note">Désactivée temporairement.</p>
            </div>
          ) : (
            <>
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantité:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="add-to-cart"
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="carousel-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setLightbox(null)}
          >
            {hasMultipleImages && (
              <button
                className="carousel-lightbox-nav carousel-lightbox-prev"
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
              >
                &#8249;
              </button>
            )}

            <motion.div
              className="carousel-lightbox-content"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="carousel-lightbox-close"
                onClick={() => setLightbox(null)}
                aria-label="Fermer"
              />
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightbox}
                  src={getOptimizedImageUrl(allImages[lightbox], 1200)}
                  alt={`Photo ${lightbox + 1}`}
                  width="600"
                  height="800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
              {hasMultipleImages && (
                <span className="carousel-lightbox-counter">
                  {lightbox + 1} / {allImages.length}
                </span>
              )}
            </motion.div>

            {hasMultipleImages && (
              <button
                className="carousel-lightbox-nav carousel-lightbox-next"
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
              >
                &#8250;
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductDetail

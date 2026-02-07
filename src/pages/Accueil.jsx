import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAnnouncementsContent } from '../services/announcementsApi'
import { getAllProducts } from '../services/productApi'
import { useInventory } from '../context/InventoryContext'
import SEO from '../components/SEO'
import SoldBadge from '../components/SoldBadge'
import CardsBlock from '../components/blocks/CardsBlock'
import CarouselBlock from '../components/blocks/CarouselBlock'
import TextBlock from '../components/blocks/TextBlock'
import '../components/blocks/Blocks.css'
import './Accueil.css'

// Contenu par défaut pour affichage immédiat (améliore LCP)
const defaultContent = {
  heroTitle: "Bienvenue à L'Atelier Gaston",
  heroSubtitle: 'Découvrez nos créations uniques alliant photographie et broderie artisanale',
  announcement: {
    active: true,
    title: 'Nouvelle Collection',
    text: 'Découvrez notre nouvelle collection de portraits brodés',
    link: '/shop',
    linkText: 'Voir la collection'
  },
  featuredTitle: 'Nos créations à la une',
  featuredProductIds: [],
  artSection: {
    active: true,
    title: '',
    text: '',
    images: []
  },
  sectionsOrder: ['hero', 'announcement', 'featured', 'art', 'cta'],
  customBlocks: []
}

function Accueil() {
  const [content, setContent] = useState(defaultContent)
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { isSold } = useInventory()

  // Touch/swipe support for mobile
  const carouselRef = useRef(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [justSwiped, setJustSwiped] = useState(false)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    // Charger le contenu des annonces en parallèle avec les produits
    const [announcementsResult, productsResult] = await Promise.all([
      getAnnouncementsContent(),
      getAllProducts()
    ])

    if (announcementsResult.success && announcementsResult.content) {
      setContent(announcementsResult.content)
    }

    if (productsResult.success) {
      setProducts(productsResult.products)
    }

    setProductsLoading(false)
  }

  // Mettre à jour les produits à la une quand content ou products changent
  useEffect(() => {
    if (content && products.length > 0) {
      let featured = []

      // Si des produits spécifiques sont sélectionnés
      if (content.featuredProductIds && content.featuredProductIds.length > 0) {
        featured = products.filter(p => content.featuredProductIds.includes(p.id))
      }

      // Sinon prendre les 8 premiers produits pour le carrousel
      if (featured.length === 0) {
        featured = products.slice(0, 8)
      }

      setFeaturedProducts(featured)
    }
  }, [content, products])

  // Dupliquer les produits pour le défilement infini
  const infiniteProducts = featuredProducts.length > 0
    ? [...featuredProducts, ...featuredProducts]
    : []

  // Navigation clavier pour la lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProduct) return
      if (e.key === 'Escape') setSelectedProduct(null)
      if (e.key === 'ArrowRight') navigateNext()
      if (e.key === 'ArrowLeft') navigatePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProduct, featuredProducts])

  // Navigation entre les photos
  const navigateNext = () => {
    if (!selectedProduct) return
    const currentIndex = featuredProducts.findIndex(p => p.id === selectedProduct.id)
    const nextIndex = (currentIndex + 1) % featuredProducts.length
    setSelectedProduct(featuredProducts[nextIndex])
  }

  const navigatePrev = () => {
    if (!selectedProduct) return
    const currentIndex = featuredProducts.findIndex(p => p.id === selectedProduct.id)
    const prevIndex = currentIndex === 0 ? featuredProducts.length - 1 : currentIndex - 1
    setSelectedProduct(featuredProducts[prevIndex])
  }

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsPaused(true)
  }

  const handleTouchMove = (e) => {
    if (!touchStart) return
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart && touchEnd) {
      const distance = touchStart - touchEnd
      const isSwipe = Math.abs(distance) > minSwipeDistance

      // Si c'est un vrai swipe, empêcher le clic qui suit
      if (isSwipe) {
        setJustSwiped(true)
        setTimeout(() => setJustSwiped(false), 300)
      }
    }

    setTouchStart(null)
    setTouchEnd(null)

    // Resume animation after a short delay
    setTimeout(() => setIsPaused(false), 2000)
  }

  // Ordre des sections (par défaut si non défini)
  const sectionsOrder = content.sectionsOrder || ['hero', 'announcement', 'featured', 'art', 'cta']

  // Rendu des sections selon l'ordre configuré
  const renderSection = (sectionKey, index) => {
    const delay = 0.2 * index

    switch (sectionKey) {
      case 'hero':
        return (
          <motion.section
            key="hero"
            className="accueil-hero"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
          >
            <h1>{content.heroTitle}</h1>
            <p className="accueil-subtitle">{content.heroSubtitle}</p>
          </motion.section>
        )

      case 'announcement':
        if (!content.announcement?.active) return null
        return (
          <motion.section
            key="announcement"
            className="accueil-announcement"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay }}
          >
            <div className="announcement-content">
              <span className="announcement-badge">Nouveauté</span>
              <h2>{content.announcement.title}</h2>
              <p>{content.announcement.text}</p>
              {content.announcement.link && (
                <Link to={content.announcement.link} className="announcement-link">
                  {content.announcement.linkText || 'En savoir plus'}
                </Link>
              )}
            </div>
          </motion.section>
        )

      case 'featured':
        return (
          <motion.section
            key="featured"
            className="accueil-featured"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
          >
            <h2>{content.featuredTitle || 'Nos créations à la une'}</h2>

            {featuredProducts.length > 0 ? (
              <div
                ref={carouselRef}
                className="infinite-carousel"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className={`infinite-carousel-track ${isPaused ? 'paused' : ''}`}
                >
                  {infiniteProducts.map((product, idx) => (
                    <div
                      key={`${product.id}-${idx}`}
                      className={`infinite-carousel-item ${isSold(product.id) ? 'sold' : ''}`}
                      onClick={() => !justSwiped && setSelectedProduct(product)}
                    >
                      <div className="infinite-carousel-image">
                        <img src={product.image} alt="" />
                        {isSold(product.id) && <SoldBadge />}
                      </div>
                      <div className="infinite-carousel-info">
                        <h3>{product.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-products">Aucune création à afficher pour le moment.</p>
            )}

            <div className="accueil-actions">
              {content.announcement?.link !== '/gallery' && (
                <Link to="/gallery" className="accueil-btn accueil-btn-secondary">
                  Voir la galerie
                </Link>
              )}
              {content.announcement?.link !== '/shop' && (
                <Link to="/shop" className="accueil-btn accueil-btn-primary">
                  Découvrir la boutique
                </Link>
              )}
            </div>
          </motion.section>
        )

      case 'art':
        if (!content.artSection?.active) return null
        return (
          <motion.section
            key="art"
            className="accueil-art-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
          >
            <h2>{content.artSection.title || 'Mon Art'}</h2>
            <div className={`art-section-content${content.artSection.mainImage ? ' with-image' : ''}`}>
              <div className="art-section-text">
                {content.artSection.text?.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {content.artSection.mainImage && (
                <div className="art-section-main-image">
                  <img src={content.artSection.mainImage} alt={content.artSection.title || 'Mon Art'} />
                </div>
              )}
            </div>
            {content.artSection.images && content.artSection.images.length > 0 && (
              <div className="art-section-images">
                {content.artSection.images.map((image, idx) => (
                  <div key={idx} className="art-section-image">
                    <img src={image} alt={`Création ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )

      case 'cta':
        return (
          <motion.section
            key="cta"
            className="accueil-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay }}
          >
            <h2>Une création sur-mesure ?</h2>
            <p>Immortalisez vos souvenirs avec une œuvre unique et personnalisée</p>
            <Link to="/sur-mesure" className="accueil-btn accueil-btn-cta">
              Créer mon œuvre
            </Link>
          </motion.section>
        )

      default: {
        const block = (content.customBlocks || []).find(b => b.id === sectionKey)
        if (!block) return null
        switch (block.type) {
          case 'cards': return <CardsBlock key={block.id} block={block} delay={delay} />
          case 'carousel': return <CarouselBlock key={block.id} block={block} delay={delay} />
          case 'text': return <TextBlock key={block.id} block={block} delay={delay} />
          default: return null
        }
      }
    }
  }

  return (
    <div className="accueil">
      <SEO
        title="Accueil"
        description="Bienvenue à L'Atelier Gaston - Artisan brodeur spécialisé dans l'implantation de cheveux sur photo. Découvrez nos nouvelles collections et créations uniques."
        url="/accueil"
      />

      {sectionsOrder.map((sectionKey, index) => renderSection(sectionKey, index))}

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="accueil-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedProduct(null)}
          >
            <button
              className="accueil-lightbox-nav accueil-lightbox-prev"
              onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
            >
              ‹
            </button>

            <motion.div
              className="accueil-lightbox-content"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="accueil-lightbox-close"
                onClick={() => setSelectedProduct(null)}
                aria-label="Fermer"
              />
              <div className="accueil-lightbox-image">
                <motion.img
                  key={selectedProduct.id}
                  src={selectedProduct.image}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="accueil-lightbox-info">
                <h3>{selectedProduct.name}</h3>
                {selectedProduct.description && (
                  <p>{selectedProduct.description}</p>
                )}
                <Link
                  to={`/product/${selectedProduct.id}`}
                  className="accueil-lightbox-link"
                  onClick={() => setSelectedProduct(null)}
                >
                  Voir les détails
                </Link>
              </div>
            </motion.div>

            <button
              className="accueil-lightbox-nav accueil-lightbox-next"
              onClick={(e) => { e.stopPropagation(); navigateNext(); }}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Accueil

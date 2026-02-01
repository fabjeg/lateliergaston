import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

function CarouselBlock({ block, delay = 0 }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const images = block?.images || []

  const next = useCallback(() => {
    if (images.length === 0) return
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    if (images.length === 0) return
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  // Autoplay
  useEffect(() => {
    if (!block?.autoplay || images.length <= 1 || lightbox !== null) return
    const interval = setInterval(next, (block.interval || 5) * 1000)
    return () => clearInterval(interval)
  }, [block?.autoplay, block?.interval, images.length, next, lightbox])

  // Keyboard nav in lightbox
  useEffect(() => {
    if (lightbox === null) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((prev) => (prev + 1) % images.length)
      if (e.key === 'ArrowLeft') setLightbox((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, images.length])

  // Lock body scroll
  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  if (!block?.active || images.length === 0) return null

  const lightboxPrev = () => setLightbox((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  const lightboxNext = () => setLightbox((prev) => (prev + 1) % images.length)

  const s = block.style || {}
  const sectionStyle = s.bgColor ? { background: s.bgColor, borderRadius: '16px', padding: '3rem 2rem' } : {}
  const titleStyle = {}
  if (s.titleColor) titleStyle.color = s.titleColor
  if (s.titleFont) titleStyle.fontFamily = s.titleFont
  if (s.titleSize) titleStyle.fontSize = s.titleSize + 'rem'

  const handleCardClick = (index) => {
    if (index === current) {
      setLightbox(current)
    } else {
      setCurrent(index)
    }
  }

  return (
    <>
      <motion.section
        key={block.id}
        className="accueil-carousel-block"
        style={sectionStyle}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
      >
        {block.title && <h2 style={titleStyle}>{block.title}</h2>}
        <div className="carousel-container">
          <div className="carousel-track">
            {images.map((image, index) => (
              <div
                key={index}
                className={`carousel-card ${getCardPosition(index, current, images.length)}`}
                onClick={() => handleCardClick(index)}
              >
                <img src={image} alt={`Slide ${index + 1}`} />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button className="carousel-nav carousel-prev" onClick={prev} aria-label="Precedent">&#8249;</button>
              <button className="carousel-nav carousel-next" onClick={next} aria-label="Suivant">&#8250;</button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={`carousel-dot ${idx === current ? 'active' : ''}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </motion.section>

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
            {images.length > 1 && (
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
                  src={images[lightbox]}
                  alt={`Photo ${lightbox + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
              {images.length > 1 && (
                <span className="carousel-lightbox-counter">
                  {lightbox + 1} / {images.length}
                </span>
              )}
            </motion.div>

            {images.length > 1 && (
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
    </>
  )
}

export default CarouselBlock

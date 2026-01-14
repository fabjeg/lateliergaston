import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import './Home.css'
import { getAllProducts } from '../services/productApi'
import Loader from '../components/Loader'

function Home() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState({})
  const [showHeartAnimation, setShowHeartAnimation] = useState({})

  useEffect(() => {
    loadArtworks()
    const savedLikes = localStorage.getItem('artworkLikes')
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes))
    }
  }, [])

  const loadArtworks = async () => {
    const result = await getAllProducts()
    if (result.success) {
      // Transform products to artworks format
      const artworksData = result.products.map(p => ({
        id: p.id,
        image: p.image,
        title: p.name
      }))
      setArtworks(artworksData)
    }
    setLoading(false)
  }

  const handleLike = (artworkId) => {
    const newLikes = {
      ...likes,
      [artworkId]: !likes[artworkId]
    }
    setLikes(newLikes)
    localStorage.setItem('artworkLikes', JSON.stringify(newLikes))

    if (newLikes[artworkId]) {
      setShowHeartAnimation({ ...showHeartAnimation, [artworkId]: true })
      setTimeout(() => {
        setShowHeartAnimation({ ...showHeartAnimation, [artworkId]: false })
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className="home">
        <section className="gallery-intro">
          <Loader text="Chargement de la galerie" />
        </section>
      </div>
    )
  }

  return (
    <div className="home">
      <section className="gallery-intro">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Exposition
        </motion.h1>
        <motion.p
          className="gallery-subtitle"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Collection de Broderies Photographiques
        </motion.p>
        <motion.div
          className="intro-text"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p>
            Découvrez une fusion unique entre photographie et art textile,
            où chaque image noir et blanc prend vie à travers des fils colorés brodés à la main.
          </p>
        </motion.div>
      </section>

      <section className="gallery">
        <div className="gallery-grid">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              className="artwork-frame"
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
              <div className="artwork-container">
                <motion.img
                  src={artwork.image}
                  alt={artwork.title}
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
                />

                <button
                  className={`like-button ${likes[artwork.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(artwork.id)}
                  aria-label="Like this artwork"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={likes[artwork.id] ? "#c77a7a" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showHeartAnimation[artwork.id] && (
                    <motion.div
                      className="heart-animation"
                      initial={{ scale: 0, opacity: 1, y: 0 }}
                      animate={{
                        scale: [0, 1.5, 1.2],
                        opacity: [1, 1, 0],
                        y: [0, -80, -150]
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                    >
                      <svg
                        width="200"
                        height="200"
                        viewBox="0 0 24 24"
                        fill="#c77a7a"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="artwork-label"
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
                  <span className="artwork-title">{artwork.title}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default Home

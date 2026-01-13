import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import './Home.css'

import img1 from '../assets/561676007_17858710800524609_966159427435168161_n.webp'
import img2 from '../assets/566027323_17860076811524609_3890717275703473961_n.webp'
import img3 from '../assets/566943302_17860077999524609_139768563597202447_n.webp'
import img4 from '../assets/572235425_17861416944524609_3463920233784334214_n.webp'
import img5 from '../assets/572844840_17861111490524609_975655948130670703_n.webp'
import img6 from '../assets/573313877_17862175311524609_6903431562385700038_n.webp'
import img7 from '../assets/573523271_17861910591524609_5276602963239441975_n.webp'
import img8 from '../assets/576458278_17862690423524609_5149917018225823158_n.webp'
import img9 from '../assets/588832750_17865251334524609_3240054877398157525_n.webp'
import img10 from '../assets/597807467_17865995514524609_7025555680287479999_n.webp'

const artworks = [
  { id: 1, image: img1, title: 'Œuvre 1' },
  { id: 2, image: img2, title: 'Œuvre 2' },
  { id: 3, image: img3, title: 'Œuvre 3' },
  { id: 4, image: img4, title: 'Œuvre 4' },
  { id: 5, image: img5, title: 'Œuvre 5' },
  { id: 6, image: img6, title: 'Œuvre 6' },
  { id: 7, image: img7, title: 'Œuvre 7' },
  { id: 8, image: img8, title: 'Œuvre 8' },
  { id: 9, image: img9, title: 'Œuvre 9' },
  { id: 10, image: img10, title: 'Œuvre 10' },
]

function Home() {
  const [likes, setLikes] = useState({})
  const [showHeartAnimation, setShowHeartAnimation] = useState({})

  useEffect(() => {
    const savedLikes = localStorage.getItem('artworkLikes')
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes))
    }
  }, [])

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

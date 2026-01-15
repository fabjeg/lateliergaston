import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProducts } from '../services/productApi'
import './HeroPage.css'

function HeroPage() {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [imagesReady, setImagesReady] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  const intervalRef = useRef(null)
  const textIntervalRef = useRef(null)
  const allGridElementsRef = useRef([])

  const density = 5
  const speed = 150
  const fullText = "L'Atelier Gaston"

  // Préchargement des images
  const preloadImages = (srcArray) => {
    return Promise.all(
      srcArray.map(src => new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = resolve
        img.src = src
      }))
    )
  }

  // Chargement des images produits
  useEffect(() => {
    const loadImages = async () => {
      const result = await getAllProducts()
      if (result.success && result.products.length > 0) {
        const productImages = result.products.map(p => p.image)
        await preloadImages(productImages)
        setImages(productImages)
        setImagesReady(true)
      }
    }
    loadImages()
  }, [])

  // Rendu des murs de la galerie
  const renderWalls = useCallback(() => {
    const directions = ['top', 'right', 'bottom', 'left']
    allGridElementsRef.current = []

    directions.forEach(dir => {
      const parent = document.querySelector(`.hero-grid-container .${dir}`)
      if (!parent) return
      parent.innerHTML = ''
      const total = density * density

      for (let i = 1; i <= total; i++) {
        const div = document.createElement('div')
        div.classList.add(`cell-${dir}-${i}`)
        parent.appendChild(div)
        allGridElementsRef.current.push(div)
      }
    })

    startImageInterval()
  }, [images, density, speed])

  // Démarrage de l'intervalle de chargement des images
  const startImageInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      const unloadedElements = allGridElementsRef.current.filter(
        el => !el.classList.contains('loaded')
      )

      if (unloadedElements.length === 0) {
        clearInterval(intervalRef.current)
        return
      }

      const randomElement = unloadedElements[Math.floor(Math.random() * unloadedElements.length)]
      const randomImage = images[Math.floor(Math.random() * images.length)]

      randomElement.style.backgroundImage = `url('${randomImage}')`
      randomElement.classList.add('loaded')
    }, speed)
  }, [images, speed])

  // Animation du texte qui s'écrit à la plume - déclenché par useEffect
  useEffect(() => {
    if (isRevealed) {
      // Réinitialiser le texte
      setDisplayedText('')

      let index = 0
      const timer = setTimeout(() => {
        textIntervalRef.current = setInterval(() => {
          index++
          if (index <= fullText.length) {
            setDisplayedText(fullText.substring(0, index))
          } else {
            clearInterval(textIntervalRef.current)
          }
        }, 120)
      }, 100)

      return () => {
        clearTimeout(timer)
        if (textIntervalRef.current) clearInterval(textIntervalRef.current)
      }
    } else {
      // Quand on ferme, on arrête et on vide
      if (textIntervalRef.current) clearInterval(textIntervalRef.current)
      setDisplayedText('')
    }
  }, [isRevealed])

  // Initialisation des murs quand les images sont prêtes
  useEffect(() => {
    if (imagesReady && images.length > 0) {
      renderWalls()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [imagesReady, images, renderWalls])

  // Animation de la distance
  const animateDistance = (toValue, duration = 800) => {
    const el = document.querySelector('.hero-grid-container')
    if (!el) return

    const fromValue = parseFloat(el.style.getPropertyValue('--rev-dis')) || 0
    const startTime = performance.now()

    const update = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newDistance = fromValue + (toValue - fromValue) * eased
      el.style.setProperty('--rev-dis', newDistance.toFixed(2))

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }

  // Révélation de la galerie
  const handleReveal = () => {
    if (isRevealed) {
      animateDistance(0, 800)
      setIsRevealed(false)
    } else {
      animateDistance(100, 1000)
      setIsRevealed(true)
    }
  }

  // Navigation vers la boutique
  const handleShopClick = () => {
    navigate('/shop')
  }

  return (
    <div className="hero-page">
      {/* Contenu central */}
      <div className={`hero-content ${isRevealed ? 'hidden' : ''}`}>
        <h2>L'Atelier<span> de Gaston</span></h2>
        <p>Broderies sur <span>photographies</span></p>
        <div className="hero-buttons">
          <button className="hero-button reveal-btn" onClick={handleReveal}>
            {isRevealed ? 'Fermer' : 'Découvrir'}
          </button>
          <button className="hero-button shop-btn" onClick={handleShopClick}>
            Boutique
          </button>
        </div>
      </div>

      {/* Navigation après reveal */}
      <div className={`hero-nav ${isRevealed ? 'visible' : ''}`}>
        <button className="hero-nav-btn" onClick={() => { animateDistance(0, 800); setIsRevealed(false); }}>
          Retour
        </button>
        <button className="hero-nav-btn primary" onClick={handleShopClick}>
          Voir la boutique
        </button>
      </div>

      {/* Texte écrit à la plume - visible après reveal */}
      <div className={`typing-text ${isRevealed ? 'visible' : ''}`}>
        <span className="typing-content" data-text={displayedText}>{displayedText}</span>
      </div>

      {/* Galerie 3D cubique */}
      <section
        className="hero-grid-container"
        style={{ '--grid-sz': density }}
      >
        <div className="right"></div>
        <div className="bottom"></div>
        <div className="left"></div>
        <div className="top"></div>
      </section>
    </div>
  )
}

export default HeroPage

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProducts } from '../services/productApi'
import './HeroPage.css'

function HeroPage() {
  const navigate = useNavigate()
  const [density] = useState(5)
  const [distance, setDistance] = useState(0)
  const [speed] = useState(150)
  const [images, setImages] = useState([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const intervalRef = useRef(null)
  const allGridElementsRef = useRef([])
  const loadedCountRef = useRef(0)
  const isClickingRef = useRef(false)
  const currentImageIndexRef = useRef(0)

  useEffect(() => {
    loadProductImages()
  }, [])

  const loadProductImages = async () => {
    const result = await getAllProducts()
    if (result.success && result.products.length > 0) {
      // Use actual product images
      const productImages = result.products.map(p => p.image)

      // Précharger toutes les images
      productImages.forEach(src => {
        const img = new Image()
        img.src = src
      })

      setImages(productImages)
    }
  }

  useEffect(() => {
    if (images.length > 0) {
      renderWalls()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [images, density, speed])

  // Gérer le clic/touch sur la galerie 3D - cycle à travers les images
  const handleGalleryInteraction = (e) => {
    // Ne pas réagir si on clique sur un bouton
    const target = e.target
    if (target.tagName === 'BUTTON' || target.closest('button')) return

    // Éviter les interactions trop rapides
    if (isClickingRef.current) return

    // Afficher l'image suivante dans l'ordre
    if (images.length > 0 && isRevealed) {
      isClickingRef.current = true
      const nextImage = images[currentImageIndexRef.current]
      setBackgroundImage(nextImage)

      // Passer à l'image suivante (boucle)
      currentImageIndexRef.current = (currentImageIndexRef.current + 1) % images.length

      // Débloquer après 300ms
      setTimeout(() => {
        isClickingRef.current = false
      }, 300)
    }
  }

  const renderWalls = () => {
    const directions = ['top', 'right', 'bottom', 'left']
    allGridElementsRef.current = []

    directions.forEach(dir => {
      const parent = document.querySelector(`.${dir}`)
      if (!parent) return
      parent.innerHTML = ''
      const total = density * density
      for (let i = 1; i <= total; i++) {
        const div = document.createElement('div')
        div.classList.add(`${dir.charAt(0)}${i}`)
        parent.appendChild(div)
        allGridElementsRef.current.push(div)
      }
    })

    startImageInterval()
  }

  const startImageInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    loadedCountRef.current = 0

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
      randomElement.style.background = `url('${randomImage}')`
      randomElement.style.backgroundSize = 'cover'
      randomElement.style.backgroundPosition = 'center'
      randomElement.classList.add('loaded')
      loadedCountRef.current++
    }, speed)
  }

  const handleReveal = () => {
    // Toggle la révélation des images (comme le projet original)
    if (isRevealed) {
      animateDistance(0, 800)
      setIsRevealed(false)
    } else {
      animateDistance(100, 1000)
      setIsRevealed(true)
    }
  }

  const animateDistance = (toValue, duration = 600) => {
    const el = document.querySelector('.hero-grid-container')
    if (!el) return

    const fromValue = parseFloat(el.style.getPropertyValue('--rev-dis')) || 0
    const startTime = performance.now()

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newDistance = fromValue + (toValue - fromValue) * eased
      el.style.setProperty('--rev-dis', newDistance.toFixed(2))

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setDistance(toValue)
      }
    }

    requestAnimationFrame(update)
  }

  const handleShopClick = () => {
    setIsRevealed(true)
    animateDistanceAndNavigate(100, 1000, '/shop')
  }

  const animateDistanceAndNavigate = (toValue, duration, destination) => {
    const el = document.querySelector('.hero-grid-container')
    if (!el) return

    const fromValue = parseFloat(el.style.getPropertyValue('--rev-dis')) || 0
    const startTime = performance.now()

    function update(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newDistance = fromValue + (toValue - fromValue) * eased
      el.style.setProperty('--rev-dis', newDistance.toFixed(2))

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        navigate(destination)
      }
    }

    requestAnimationFrame(update)
  }

  const handleReset = () => {
    setIsRevealed(false)
    animateDistance(0, 800)
  }

  return (
    <div
      className="hero-page"
      style={backgroundImage ? {
        background: `url('${backgroundImage}') center/17% no-repeat`,
        backgroundColor: '#faf8f5'
      } : {}}
      onClick={handleGalleryInteraction}
      onTouchEnd={handleGalleryInteraction}
    >
      <div className={`hero-content ${isRevealed ? 'hidden' : ''}`}>
        <h2>L'Atelier<span> de Gaston</span></h2>
        <p>Broderies sur <span>photographies</span></p>
        <div className="hero-buttons">
          <button className="hero-button reveal-btn" onClick={handleReveal}>
            Découvrir
          </button>
          <button className="hero-button shop-btn" onClick={handleShopClick}>
            Boutique
          </button>
        </div>
      </div>

      <div className={`hero-nav ${isRevealed ? 'visible' : ''}`}>
        <button className="hero-nav-btn" onClick={handleReset}>
          Retour
        </button>
        <button className="hero-nav-btn primary" onClick={() => navigate('/shop')}>
          Voir la boutique
        </button>
      </div>


      <section
        className="hero-grid-container"
        style={{
          '--grid-sz': density
        }}
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

import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import './Header.css'
import logo from '../assets/Logo_coffee_shop_illustratif_minimaliste_bleu_et_marron_clair__2_-removebg-preview.png'
import CartIcon from './CartIcon'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const clickCount = useRef(0)
  const clickTimer = useRef(null)

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogoClick = (e) => {
    e.preventDefault()
    clickCount.current += 1

    // Reset timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current)
    }

    // If 3 clicks, go to admin
    if (clickCount.current >= 3) {
      clickCount.current = 0
      closeMenu()
      navigate('/admin/login')
      return
    }

    // After 500ms without more clicks, go to home
    clickTimer.current = setTimeout(() => {
      if (clickCount.current > 0 && clickCount.current < 3) {
        closeMenu()
        navigate('/')
      }
      clickCount.current = 0
    }, 500)
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={handleLogoClick}>
          <img src={logo} alt="L'Atelier de Gaston" className="logo-img" />
        </Link>

        {/* Hamburger button */}
        <button
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation */}
        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/gallery" onClick={closeMenu}>Galerie</Link>
          <Link to="/shop" onClick={closeMenu}>Boutique</Link>
          <Link to="/sur-mesure" onClick={closeMenu}>Sur-Mesure</Link>
          <Link to="/about" onClick={closeMenu}>À propos</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  )
}

export default Header

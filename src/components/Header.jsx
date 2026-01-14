import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Header.css'
import logo from '../assets/logo.webp'
import CartIcon from './CartIcon'

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
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
          <Link to="/" onClick={closeMenu}>Galerie</Link>
          <Link to="/shop" onClick={closeMenu}>Boutique</Link>
          <Link to="/about" onClick={closeMenu}>À propos</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          <Link to="/admin/login" onClick={closeMenu} className="admin-link">Admin</Link>
          <CartIcon />
        </nav>
      </div>
    </header>
  )
}

export default Header

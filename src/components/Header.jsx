import { Link } from 'react-router-dom'
import './Header.css'
import logo from '../assets/logo.jpg'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src={logo} alt="L'Atelier de Gaston" className="logo-img" />
        </Link>
        <nav className="nav">
          <Link to="/">Galerie</Link>
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

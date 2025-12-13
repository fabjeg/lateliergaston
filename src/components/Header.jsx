import { Link } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>L'Atelier de Gaston</h1>
        </Link>
        <nav className="nav">
          <Link to="/">Accueil</Link>
          <Link to="/about">À propos</Link>
          <Link to="/shop">Boutique</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cart" className="cart-link">Panier</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

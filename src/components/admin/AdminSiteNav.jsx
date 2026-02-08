import { Link } from 'react-router-dom'
import './AdminSiteNav.css'

function AdminSiteNav() {
  return (
    <nav className="admin-site-nav">
      <div className="admin-site-nav-inner">
        <Link to="/accueil">Accueil</Link>
        <Link to="/shop">Boutique</Link>
        <Link to="/gallery">Galerie</Link>
        <Link to="/about">{'\u00c0 propos'}</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/sur-mesure">Sur-mesure</Link>
        <span className="admin-site-nav-sep">|</span>
        <Link to="/admin/dashboard" className="admin-site-nav-admin">Administration</Link>
      </div>
    </nav>
  )
}

export default AdminSiteNav

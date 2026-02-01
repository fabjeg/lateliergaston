import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import './HeroPage.css'

function HeroPage() {
  const navigate = useNavigate()

  const handleDiscover = () => {
    navigate('/accueil')
  }

  return (
    <div className="hero-page">
      <SEO
        title="Accueil"
        description="L'Atelier Gaston - Artisan brodeur spécialisé dans l'implantation de cheveux sur photo. Découvrez nos créations uniques et personnalisées."
        url="/"
      />
      {/* Contenu central */}
      <div className="hero-content">
        <h2>L'Atelier Gaston</h2>
        <p className="hero-tagline">Implantation de cheveux sur photo</p>
        <div className="hero-buttons">
          <button className="hero-button" onClick={handleDiscover}>
            Découvrir
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeroPage

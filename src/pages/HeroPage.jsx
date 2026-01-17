import { useNavigate } from 'react-router-dom'
import './HeroPage.css'

function HeroPage() {
  const navigate = useNavigate()

  const handleDiscover = () => {
    navigate('/gallery')
  }

  return (
    <div className="hero-page">
      {/* Contenu central */}
      <div className="hero-content">
        <h2>L'Atelier Gaston</h2>
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

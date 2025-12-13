import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Bienvenue à L'Atelier de Gaston</h1>
        <p>Découvrez nos créations artisanales uniques</p>
        <Link to="/shop" className="cta-button">Découvrir la boutique</Link>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Fait main</h3>
          <p>Chaque produit est créé avec soin et passion</p>
        </div>
        <div className="feature">
          <h3>Qualité artisanale</h3>
          <p>Des matériaux de première qualité</p>
        </div>
        <div className="feature">
          <h3>Unique</h3>
          <p>Des créations originales et authentiques</p>
        </div>
      </section>
    </div>
  )
}

export default Home

import './About.css'
import aboutImage from '../assets/581228718_17863103313524609_4932862236785945648_n.jpg'

function About() {
  return (
    <div className="about">
      <h1>À propos de L'Atelier de Gaston</h1>

      <div className="about-hero">
        <div className="about-hero-image-wrapper">
          <img
            src={aboutImage}
            alt="L'Atelier de Gaston - Broderie artisanale"
            className="about-hero-image"
          />
        </div>
        <div className="about-hero-text">
          <h2>L'art de la broderie contemporaine</h2>
          <p>
            L'Atelier de Gaston est né de la passion pour l'artisanat et la création unique.
            Chaque œuvre est une fusion entre photographie et broderie, créant des pièces
            uniques qui racontent une histoire.
          </p>
          <p>
            Nous croyons en la valeur du fait-main et en l'importance de préserver
            les techniques artisanales traditionnelles tout en y apportant une touche
            contemporaine et artistique.
          </p>
        </div>
      </div>

      <div className="about-content">
        <section>
          <h2>Notre histoire</h2>
          <p>
            L'Atelier de Gaston est né de la passion pour l'artisanat et la création unique.
            Depuis ses débuts, notre atelier s'engage à produire des pièces de qualité,
            fabriquées avec soin et attention aux détails.
          </p>
        </section>

        <section>
          <h2>Notre mission</h2>
          <p>
            Nous croyons en la valeur du fait-main et en l'importance de préserver
            les techniques artisanales traditionnelles. Chaque produit est une œuvre
            d'art en soi, conçue pour durer et apporter de la joie à son propriétaire.
          </p>
        </section>

        <section>
          <h2>Nos valeurs</h2>
          <ul>
            <li>Qualité artisanale</li>
            <li>Matériaux durables et éthiques</li>
            <li>Créativité et innovation</li>
            <li>Satisfaction client</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default About

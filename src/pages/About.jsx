import './About.css'

function About() {
  return (
    <div className="about">
      <h1>À propos de L'Atelier de Gaston</h1>
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

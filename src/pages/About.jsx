import { useState, useEffect } from 'react'
import { getAboutContent } from '../services/aboutApi'
import Loader from '../components/Loader'
import './About.css'
import aboutImage from '../assets/581228718_17863103313524609_4932862236785945648_n.jpg'

function About() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    const result = await getAboutContent()
    if (result.success && result.content) {
      setContent(result.content)
    } else {
      // Contenu par défaut si erreur
      setContent({
        heroTitle: "L'art de la broderie contemporaine",
        heroText1: "L'Atelier de Gaston est né de la passion pour l'artisanat et la création unique. Chaque œuvre est une fusion entre photographie et broderie, créant des pièces uniques qui racontent une histoire.",
        heroText2: "Nous croyons en la valeur du fait-main et en l'importance de préserver les techniques artisanales traditionnelles tout en y apportant une touche contemporaine et artistique.",
        section1Title: "Notre histoire",
        section1Text: "L'Atelier de Gaston est né de la passion pour l'artisanat et la création unique. Depuis ses débuts, notre atelier s'engage à produire des pièces de qualité, fabriquées avec soin et attention aux détails.",
        section2Title: "Notre mission",
        section2Text: "Nous croyons en la valeur du fait-main et en l'importance de préserver les techniques artisanales traditionnelles. Chaque produit est une œuvre d'art en soi, conçue pour durer et apporter de la joie à son propriétaire.",
        section3Title: "Nos valeurs",
        values: [
          "Qualité artisanale",
          "Matériaux durables et éthiques",
          "Créativité et innovation",
          "Satisfaction client"
        ]
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="about">
        <Loader text="Chargement" />
      </div>
    )
  }

  return (
    <div className="about">
      <h1>L'Atelier Gaston</h1>

      <div className="about-hero">
        <div className="about-hero-image-wrapper">
          <img
            src={aboutImage}
            alt="L'Atelier de Gaston - Broderie artisanale"
            className="about-hero-image"
          />
        </div>
        <div className="about-hero-text">
          <h2>{content.heroTitle}</h2>
          <p>{content.heroText1}</p>
          <p>{content.heroText2}</p>
        </div>
      </div>

      <div className="about-content">
        <section>
          <h2>{content.section1Title}</h2>
          <p>{content.section1Text}</p>
        </section>

        <section>
          <h2>{content.section2Title}</h2>
          <p>{content.section2Text}</p>
        </section>

        <section>
          <h2>{content.section3Title}</h2>
          <ul>
            {content.values && content.values.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default About

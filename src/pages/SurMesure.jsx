import { useState } from 'react'
import { motion } from 'framer-motion'
import './SurMesure.css'

// Images de la galerie
import gallery1 from '../assets/561676007_17858710800524609_966159427435168161_n.webp'
import gallery2 from '../assets/566027323_17860076811524609_3890717275703473961_n.webp'
import gallery3 from '../assets/566943302_17860077999524609_139768563597202447_n.webp'
import gallery4 from '../assets/572235425_17861416944524609_3463920233784334214_n.webp'
import gallery5 from '../assets/572844840_17861111490524609_975655948130670703_n.webp'
import gallery6 from '../assets/573313877_17862175311524609_6903431562385700038_n.webp'
import gallery7 from '../assets/573523271_17861910591524609_5276602963239441975_n.webp'
import gallery8 from '../assets/576458278_17862690423524609_5149917018225823158_n.webp'

function SurMesure() {
  const [formData, setFormData] = useState({
    photoOption: 'gallery', // 'gallery' ou 'upload'
    selectedPhoto: null,
    uploadedPhoto: null,
    uploadedPhotoPreview: null,
    materiau: '',
    papier: '',
    cadre: false,
    description: ''
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [galleryExpanded, setGalleryExpanded] = useState(false)

  // Photos de la galerie (exemples)
  const galleryPhotos = [
    { id: 1, src: gallery1, alt: 'Exemple 1' },
    { id: 2, src: gallery2, alt: 'Exemple 2' },
    { id: 3, src: gallery3, alt: 'Exemple 3' },
    { id: 4, src: gallery4, alt: 'Exemple 4' },
    { id: 5, src: gallery5, alt: 'Exemple 5' },
    { id: 6, src: gallery6, alt: 'Exemple 6' },
    { id: 7, src: gallery7, alt: 'Exemple 7' },
    { id: 8, src: gallery8, alt: 'Exemple 8' },
  ]

  const visiblePhotos = galleryExpanded ? galleryPhotos : galleryPhotos.slice(0, 4)
  const hasMorePhotos = galleryPhotos.length > 4

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 10 Mo')
        return
      }
      setFormData({
        ...formData,
        uploadedPhoto: file,
        uploadedPhotoPreview: URL.createObjectURL(file),
        selectedPhoto: null
      })
      setError('')
    }
  }

  const handleGallerySelect = (photoId) => {
    setFormData({
      ...formData,
      selectedPhoto: photoId,
      uploadedPhoto: null,
      uploadedPhotoPreview: null
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.photoOption === 'gallery' && !formData.selectedPhoto) {
      setError('Veuillez sélectionner une photo de la galerie')
      return
    }
    if (formData.photoOption === 'upload' && !formData.uploadedPhoto) {
      setError('Veuillez télécharger votre photo')
      return
    }
    if (!formData.materiau) {
      setError('Veuillez choisir un matériau')
      return
    }
    if (!formData.papier) {
      setError('Veuillez choisir un type de papier')
      return
    }
    if (!formData.description.trim()) {
      setError('Veuillez décrire votre projet')
      return
    }

    setSending(true)

    // Simuler l'envoi (à remplacer par une vraie API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSent(true)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="sur-mesure">
        <motion.div
          className="success-message-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="success-icon-large">✓</div>
          <h2>Demande envoyée avec succès !</h2>
          <p>Nous avons bien reçu votre demande de création sur-mesure.</p>
          <p>Nous vous contacterons dans les plus brefs délais pour discuter de votre projet.</p>
          <button
            className="btn-new-request"
            onClick={() => {
              setSent(false)
              setFormData({
                photoOption: 'gallery',
                selectedPhoto: null,
                uploadedPhoto: null,
                uploadedPhotoPreview: null,
                materiau: '',
                papier: '',
                cadre: false,
                description: ''
              })
            }}
          >
            Nouvelle demande
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="sur-mesure">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Création Sur-Mesure</h1>
        <p className="sur-mesure-subtitle">
          Créez votre œuvre unique et personnalisée
        </p>
      </motion.div>

      <motion.form
        className="sur-mesure-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {error && <div className="form-error">{error}</div>}

        {/* Section Photo */}
        <section className="form-section">
          <h2>1. Votre Photo</h2>

          <div className="photo-options">
            <label className={`photo-option ${formData.photoOption === 'gallery' ? 'active' : ''}`}>
              <input
                type="radio"
                name="photoOption"
                value="gallery"
                checked={formData.photoOption === 'gallery'}
                onChange={(e) => setFormData({ ...formData, photoOption: e.target.value })}
              />
              <span className="option-label">Choisir dans la galerie</span>
            </label>
            <label className={`photo-option ${formData.photoOption === 'upload' ? 'active' : ''}`}>
              <input
                type="radio"
                name="photoOption"
                value="upload"
                checked={formData.photoOption === 'upload'}
                onChange={(e) => setFormData({ ...formData, photoOption: e.target.value })}
              />
              <span className="option-label">Envoyer ma photo</span>
            </label>
          </div>

          {formData.photoOption === 'gallery' && (
            <div className="gallery-container">
              <div className="gallery-grid">
                {visiblePhotos.map(photo => (
                  <div
                    key={photo.id}
                    className={`gallery-item ${formData.selectedPhoto === photo.id ? 'selected' : ''}`}
                    onClick={() => handleGallerySelect(photo.id)}
                  >
                    <img src={photo.src} alt={photo.alt} />
                    {formData.selectedPhoto === photo.id && (
                      <div className="selected-overlay">✓</div>
                    )}
                  </div>
                ))}
              </div>
              {hasMorePhotos && (
                <button
                  type="button"
                  className="gallery-expand-btn"
                  onClick={() => setGalleryExpanded(!galleryExpanded)}
                >
                  <span>{galleryExpanded ? 'Voir moins' : 'Voir plus'}</span>
                  <span className={`expand-arrow ${galleryExpanded ? 'expanded' : ''}`}>▼</span>
                </button>
              )}
            </div>
          )}

          {formData.photoOption === 'upload' && (
            <div className="upload-zone">
              {formData.uploadedPhotoPreview ? (
                <div className="upload-preview">
                  <img src={formData.uploadedPhotoPreview} alt="Aperçu" />
                  <button
                    type="button"
                    className="btn-remove-photo"
                    onClick={() => setFormData({
                      ...formData,
                      uploadedPhoto: null,
                      uploadedPhotoPreview: null
                    })}
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="upload-input"
                  />
                  <div className="upload-content">
                    <span className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </span>
                    <span className="upload-text">Cliquez pour télécharger votre photo</span>
                    <span className="upload-hint">JPG, PNG - Max 10 Mo</span>
                  </div>
                </label>
              )}
            </div>
          )}
        </section>

        {/* Section Matériau */}
        <section className="form-section">
          <h2>2. Matériau</h2>
          <div className="options-grid">
            <label className={`option-card ${formData.materiau === 'cheveux-artificiels' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="materiau"
                value="cheveux-artificiels"
                checked={formData.materiau === 'cheveux-artificiels'}
                onChange={(e) => setFormData({ ...formData, materiau: e.target.value })}
              />
              <span className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8 2 6 5 6 8c0 2 1 4 2 5.5C9 15 10 17 10 19v3h4v-3c0-2 1-4 2-5.5 1-1.5 2-3.5 2-5.5 0-3-2-6-6-6z"/>
                  <path d="M10 22h4"/>
                  <path d="M12 2v4"/>
                </svg>
              </span>
              <span className="option-title">Cheveux Artificiels</span>
              <span className="option-desc">Fibres synthétiques de haute qualité</span>
            </label>

            <label className={`option-card ${formData.materiau === 'poils-animaux' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="materiau"
                value="poils-animaux"
                checked={formData.materiau === 'poils-animaux'}
                onChange={(e) => setFormData({ ...formData, materiau: e.target.value })}
              />
              <span className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="10" r="7"/>
                  <path d="M8.5 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5"/>
                  <path d="M12.5 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5"/>
                  <path d="M9 12h6"/>
                  <path d="M10 14c.6.6 1.3 1 2 1s1.4-.4 2-1"/>
                  <path d="M7 3l-2-1"/>
                  <path d="M17 3l2-1"/>
                  <path d="M12 17v4"/>
                  <path d="M8 21h8"/>
                </svg>
              </span>
              <span className="option-title">Poils d'Animaux</span>
              <span className="option-desc">Immortalisez votre compagnon</span>
            </label>

            <label className={`option-card ${formData.materiau === 'cheveux-bebe' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="materiau"
                value="cheveux-bebe"
                checked={formData.materiau === 'cheveux-bebe'}
                onChange={(e) => setFormData({ ...formData, materiau: e.target.value })}
              />
              <span className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M12 3c-1 0-2 .5-2.5 1"/>
                  <path d="M12 3c1 0 2 .5 2.5 1"/>
                </svg>
              </span>
              <span className="option-title">Cheveux de Bébé</span>
              <span className="option-desc">Un souvenir précieux et unique</span>
            </label>
          </div>
        </section>

        {/* Section Papier */}
        <section className="form-section">
          <h2>3. Type de Papier</h2>
          <div className="options-grid options-grid-2">
            <label className={`option-card ${formData.papier === 'papier-photo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="papier"
                value="papier-photo"
                checked={formData.papier === 'papier-photo'}
                onChange={(e) => setFormData({ ...formData, papier: e.target.value })}
              />
              <span className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </span>
              <span className="option-title">Papier Photo</span>
              <span className="option-desc">Finition brillante et détails nets</span>
            </label>

            <label className={`option-card ${formData.papier === 'papier-art' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="papier"
                value="papier-art"
                checked={formData.papier === 'papier-art'}
                onChange={(e) => setFormData({ ...formData, papier: e.target.value })}
              />
              <span className="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </span>
              <span className="option-title">Papier d'Art</span>
              <span className="option-desc">Texture noble et rendu artistique</span>
            </label>
          </div>
        </section>

        {/* Section Cadre */}
        <section className="form-section">
          <h2>4. Cadre</h2>
          <label className="cadre-toggle">
            <input
              type="checkbox"
              checked={formData.cadre}
              onChange={(e) => setFormData({ ...formData, cadre: e.target.checked })}
            />
            <span className="toggle-switch"></span>
            <span className="toggle-label">
              {formData.cadre ? 'Avec cadre' : 'Sans cadre'}
            </span>
          </label>
          {formData.cadre && (
            <p className="cadre-note">
              Un cadre élégant sera sélectionné pour mettre en valeur votre œuvre.
            </p>
          )}
        </section>

        {/* Section Description */}
        <section className="form-section">
          <h2>5. Décrivez votre projet</h2>
          <textarea
            className="description-textarea"
            placeholder="Décrivez votre vision, vos souhaits particuliers, les dimensions souhaitées, les couleurs préférées..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
          />
        </section>

        {/* Bouton Envoyer */}
        <button
          type="submit"
          className="btn-submit"
          disabled={sending}
        >
          {sending ? 'Envoi en cours...' : 'Envoyer ma demande'}
        </button>
      </motion.form>
    </div>
  )
}

export default SurMesure

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { getAllProducts } from '../services/productApi'
import { createCustomOrder, fileToBase64 } from '../services/customOrderApi'
import SEO from '../components/SEO'
import AnimalHairModal from '../components/AnimalHairModal'
import './SurMesure.css'

// Configuration EmailJS - à définir dans .env
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_TEMPLATE_CLIENT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENT_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function SurMesure() {
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    photoOption: 'gallery', // 'gallery' ou 'upload'
    selectedPhoto: null,
    selectedPhotoUrl: null,
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
  const [showAnimalHairModal, setShowAnimalHairModal] = useState(false)
  const [animalHairConfirmed, setAnimalHairConfirmed] = useState(false)

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 5000)
    return () => clearTimeout(timer)
  }, [error])

  // Charger les photos depuis l'API
  useEffect(() => {
    const loadGalleryPhotos = async () => {
      const result = await getAllProducts()
      if (result.success) {
        const photos = result.products.slice(0, 8).map((product, index) => ({
          id: product.id,
          src: product.image,
          alt: product.name || `Exemple ${index + 1}`
        }))
        setGalleryPhotos(photos)
      }
    }
    loadGalleryPhotos()
  }, [])

  const visiblePhotos = galleryExpanded ? galleryPhotos : galleryPhotos.slice(0, 4)
  const hasMorePhotos = galleryPhotos.length > 4

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('La photo ne doit pas dépasser 4 Mo')
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

  const handleGallerySelect = (photoId, photoUrl) => {
    setFormData({
      ...formData,
      selectedPhoto: photoId,
      selectedPhotoUrl: photoUrl,
      uploadedPhoto: null,
      uploadedPhotoPreview: null
    })
  }

  const handleMateriauChange = (value) => {
    if (value === 'poils-animaux' && !animalHairConfirmed) {
      setShowAnimalHairModal(true)
      return
    }
    if (value !== 'poils-animaux') {
      setAnimalHairConfirmed(false)
    }
    setFormData({ ...formData, materiau: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation des informations client
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      setError('Veuillez entrer votre nom (minimum 2 caractères)')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.customerEmail || !emailRegex.test(formData.customerEmail)) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    // Validation photo
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
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Veuillez décrire votre projet (minimum 10 caractères)')
      return
    }

    setSending(true)

    try {
      // Convertir la photo uploadée en base64 si nécessaire
      let uploadedPhotoBase64 = null
      if (formData.photoOption === 'upload' && formData.uploadedPhoto) {
        uploadedPhotoBase64 = await fileToBase64(formData.uploadedPhoto)
      }

      // Préparer les données pour l'API
      const orderData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim() || null,
        photoOption: formData.photoOption,
        selectedPhotoId: formData.selectedPhoto,
        selectedPhotoUrl: formData.selectedPhotoUrl,
        uploadedPhotoBase64,
        materiau: formData.materiau,
        papier: formData.papier,
        cadre: formData.cadre,
        description: formData.description.trim()
      }

      // Sauvegarder la demande dans MongoDB
      const apiResult = await createCustomOrder(orderData)
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Erreur lors de l\'enregistrement')
      }

      // Envoyer l'email via EmailJS
      const materiauLabels = {
        'cheveux-artificiels': 'Cheveux Artificiels',
        'poils-animaux': 'Poils d\'Animaux',
        'cheveux-bebe': 'Cheveux de Bébé'
      }
      const papierLabels = {
        'papier-photo': 'Papier Photo',
        'papier-art': 'Papier d\'Art'
      }

      // Determine photo URL for email
      let photoUrl = ''
      if (apiResult.uploadedPhotoUrl) {
        photoUrl = apiResult.uploadedPhotoUrl
      } else if (formData.photoOption === 'gallery' && formData.selectedPhotoUrl) {
        photoUrl = formData.selectedPhotoUrl
      }

      const emailParams = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone || 'Non renseigné',
        photo_option: formData.photoOption === 'gallery' ? 'Photo de la galerie' : 'Photo personnelle',
        materiau: materiauLabels[formData.materiau] || formData.materiau,
        papier: papierLabels[formData.papier] || formData.papier,
        cadre: formData.cadre ? 'Oui' : 'Non',
        description: formData.description,
        order_id: apiResult.orderId,
        photo_url: photoUrl
      }

      // Envoyer l'email à l'admin
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      )

      // Envoyer l'email de confirmation au client
      if (EMAILJS_TEMPLATE_CLIENT_ID) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_CLIENT_ID,
          emailParams,
          EMAILJS_PUBLIC_KEY
        )
      }

      setSent(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err)
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
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
              setAnimalHairConfirmed(false)
              setFormData({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                photoOption: 'gallery',
                selectedPhoto: null,
                selectedPhotoUrl: null,
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
      <SEO
        title="Création Sur-Mesure"
        description="Créez votre œuvre personnalisée : portrait brodé avec cheveux, poils d'animaux ou cheveux de bébé. Commandez votre création unique sur-mesure."
        url="/sur-mesure"
      />
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

        {/* Section Informations Client */}
        <section className="form-section">
          <h2>1. Vos Coordonnées</h2>
          <div className="customer-fields">
            <div className="form-field">
              <label htmlFor="customerName">Nom complet *</label>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Votre nom"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="customerEmail">Email *</label>
              <input
                type="email"
                id="customerEmail"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="customerPhone">Téléphone (optionnel)</label>
              <input
                type="tel"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>
        </section>

        {/* Section Photo */}
        <section className="form-section">
          <h2>2. Votre Photo</h2>

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
                    onClick={() => handleGallerySelect(photo.id, photo.src)}
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
                    <span className="upload-hint">JPG, PNG - Max 4 Mo</span>
                  </div>
                </label>
              )}
            </div>
          )}
        </section>

        {/* Section Matériau */}
        <section className="form-section">
          <h2>3. Matériau</h2>
          <div className="options-grid">
            <label className={`option-card ${formData.materiau === 'cheveux-artificiels' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="materiau"
                value="cheveux-artificiels"
                checked={formData.materiau === 'cheveux-artificiels'}
                onChange={(e) => handleMateriauChange(e.target.value)}
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
                onChange={(e) => handleMateriauChange(e.target.value)}
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
                onChange={(e) => handleMateriauChange(e.target.value)}
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
          <h2>4. Type de Papier</h2>
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
          <h2>5. Cadre</h2>
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
          <h2 id="description-label">6. Décrivez votre projet</h2>
          <textarea
            className="description-textarea"
            placeholder="Décrivez votre vision, vos souhaits particuliers, les dimensions souhaitées, les couleurs préférées..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            aria-labelledby="description-label"
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

      <AnimalHairModal
        isOpen={showAnimalHairModal}
        onConfirm={() => {
          setAnimalHairConfirmed(true)
          setShowAnimalHairModal(false)
          setFormData(prev => ({ ...prev, materiau: 'poils-animaux' }))
        }}
        onDismiss={() => {
          setShowAnimalHairModal(false)
        }}
      />
    </div>
  )
}

export default SurMesure

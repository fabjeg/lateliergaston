import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAboutContent, updateAboutContent } from '../../services/aboutApi'
import BackButton from '../../components/BackButton'
import Loader from '../../components/Loader'
import './AdminAbout.css'

function AdminAbout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [content, setContent] = useState({
    heroTitle: '',
    heroText1: '',
    heroText2: '',
    section1Title: '',
    section1Text: '',
    section2Title: '',
    section2Text: '',
    section3Title: '',
    values: ['', '', '', '']
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    const result = await getAboutContent()
    if (result.success && result.content) {
      setContent({
        heroTitle: result.content.heroTitle || '',
        heroText1: result.content.heroText1 || '',
        heroText2: result.content.heroText2 || '',
        section1Title: result.content.section1Title || '',
        section1Text: result.content.section1Text || '',
        section2Title: result.content.section2Title || '',
        section2Text: result.content.section2Text || '',
        section3Title: result.content.section3Title || '',
        values: result.content.values || ['', '', '', '']
      })
    }
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  const handleValueChange = (index, value) => {
    setContent(prev => {
      const newValues = [...prev.values]
      newValues[index] = value
      return { ...prev, values: newValues }
    })
  }

  const addValue = () => {
    setContent(prev => ({
      ...prev,
      values: [...prev.values, '']
    }))
  }

  const removeValue = (index) => {
    setContent(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const result = await updateAboutContent(content)

    if (result.success) {
      setMessage({ type: 'success', text: 'Contenu mis à jour avec succès !' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
    }

    setSaving(false)

    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="admin-about">
        <Loader text="Chargement du contenu" />
      </div>
    )
  }

  return (
    <div className="admin-about">
      <BackButton to="/admin/dashboard" />

      <h1>Modifier la page À propos</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section Hero */}
        <div className="form-section">
          <h2>Section principale (à côté de la photo)</h2>

          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder="L'art de la broderie contemporaine"
            />
          </div>

          <div className="form-group">
            <label>Premier paragraphe</label>
            <textarea
              value={content.heroText1}
              onChange={(e) => handleChange('heroText1', e.target.value)}
              rows={4}
              placeholder="Texte du premier paragraphe..."
            />
          </div>

          <div className="form-group">
            <label>Deuxième paragraphe</label>
            <textarea
              value={content.heroText2}
              onChange={(e) => handleChange('heroText2', e.target.value)}
              rows={4}
              placeholder="Texte du deuxième paragraphe..."
            />
          </div>
        </div>

        {/* Section 1 */}
        <div className="form-section">
          <h2>Première section</h2>

          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={content.section1Title}
              onChange={(e) => handleChange('section1Title', e.target.value)}
              placeholder="Notre histoire"
            />
          </div>

          <div className="form-group">
            <label>Texte</label>
            <textarea
              value={content.section1Text}
              onChange={(e) => handleChange('section1Text', e.target.value)}
              rows={4}
              placeholder="Texte de la section..."
            />
          </div>
        </div>

        {/* Section 2 */}
        <div className="form-section">
          <h2>Deuxième section</h2>

          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={content.section2Title}
              onChange={(e) => handleChange('section2Title', e.target.value)}
              placeholder="Notre mission"
            />
          </div>

          <div className="form-group">
            <label>Texte</label>
            <textarea
              value={content.section2Text}
              onChange={(e) => handleChange('section2Text', e.target.value)}
              rows={4}
              placeholder="Texte de la section..."
            />
          </div>
        </div>

        {/* Section 3 - Valeurs */}
        <div className="form-section">
          <h2>Troisième section (Valeurs)</h2>

          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={content.section3Title}
              onChange={(e) => handleChange('section3Title', e.target.value)}
              placeholder="Nos valeurs"
            />
          </div>

          <div className="form-group">
            <label>Liste des valeurs</label>
            {content.values.map((value, index) => (
              <div key={index} className="value-item">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder={`Valeur ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeValue(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={addValue}
            >
              + Ajouter une valeur
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminAbout

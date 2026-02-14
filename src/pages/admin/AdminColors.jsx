import { useState, useEffect } from 'react'
import { getSettings, updateSettings, invalidateSettingsCache } from '../../services/settingsApi'
import { useTheme } from '../../context/ThemeContext'
import BackButton from '../../components/BackButton'
import './AdminColors.css'

const DEFAULTS = {
  headingColor: '#7a3540',
  subtitleColor: '#4a4a4a',
  textColor: '#1a1a1a',
  buttonBg: '#7a3540',
  buttonText: '#ffffff',
  announcementBg: '#f8f4f0',
  ctaBg: '#2c3e50',
  fontFamily: 'Zen Loop',
  fontSize: '1.6rem',
  fontWeight: '500'
}

const FONT_OPTIONS = [
  'Zen Loop',
  'Cormorant Garamond',
  'IBM Plex Sans',
  'Lato',
  'Manrope',
  'Montserrat',
  'Open Sans',
  'Playfair Display',
  'Playwrite AT',
  'Raleway',
  'SF Pro',
  'Sora'
]

const FONT_SIZE_OPTIONS = [
  { value: '1.3rem', label: 'Petit' },
  { value: '1.5rem', label: 'Normal' },
  { value: '1.7rem', label: 'Grand' },
  { value: '1.9rem', label: 'Tres grand' }
]

const FONT_WEIGHT_OPTIONS = [
  { value: '400', label: 'Fin' },
  { value: '500', label: 'Normal' },
  { value: '600', label: 'Semi-gras' },
  { value: '700', label: 'Gras' }
]

const COLOR_FIELDS = [
  { key: 'headingColor', label: 'Couleur des titres (h1, h2, h3)' },
  { key: 'subtitleColor', label: 'Couleur des sous-titres' },
  { key: 'textColor', label: 'Couleur du texte courant' },
  { key: 'buttonBg', label: 'Fond des boutons' },
  { key: 'buttonText', label: 'Texte des boutons' },
  { key: 'announcementBg', label: 'Fond section Annonces (Accueil)' },
  { key: 'ctaBg', label: 'Fond section Sur Mesure (Accueil)' }
]

function AdminColors() {
  const { refreshTheme } = useTheme()
  const [colors, setColors] = useState({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadColors()
  }, [])

  const loadColors = async () => {
    const result = await getSettings()
    if (result.success && result.settings) {
      setColors({
        headingColor: result.settings.headingColor || DEFAULTS.headingColor,
        subtitleColor: result.settings.subtitleColor || DEFAULTS.subtitleColor,
        textColor: result.settings.textColor || DEFAULTS.textColor,
        buttonBg: result.settings.buttonBg || DEFAULTS.buttonBg,
        buttonText: result.settings.buttonText || DEFAULTS.buttonText,
        announcementBg: result.settings.announcementBg || DEFAULTS.announcementBg,
        ctaBg: result.settings.ctaBg || DEFAULTS.ctaBg,
        fontFamily: result.settings.fontFamily || DEFAULTS.fontFamily,
        fontSize: result.settings.fontSize || DEFAULTS.fontSize,
        fontWeight: result.settings.fontWeight || DEFAULTS.fontWeight
      })
    }
    setLoading(false)
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleColorChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const handleHexInput = (key, value) => {
    if (value.length <= 7) {
      const formatted = value.startsWith('#') ? value : `#${value}`
      setColors(prev => ({ ...prev, [key]: formatted }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    invalidateSettingsCache()
    const result = await updateSettings(colors)
    if (result.success) {
      await refreshTheme()
      showMessage('Couleurs enregistrees avec succes !', 'success')
    } else {
      showMessage(result.error || 'Erreur lors de la sauvegarde', 'error')
    }
    setSaving(false)
  }

  const handleReset = () => {
    setColors({ ...DEFAULTS })
  }

  if (loading) {
    return (
      <div className="admin-colors">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="admin-colors">
      <BackButton to="/admin/dashboard" label="Retour au dashboard" />
      <h1>Couleurs du site</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="color-groups">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="color-group">
            <label>{label}</label>
            <div className="color-inputs">
              <input
                type="color"
                className="color-picker"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
              />
              <input
                type="text"
                className="color-hex-input"
                value={colors[key]}
                onChange={(e) => handleHexInput(key, e.target.value)}
                maxLength={7}
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="font-settings">
        <div className="font-group">
          <label>Police d'ecriture</label>
          <select
            value={colors.fontFamily}
            onChange={(e) => setColors(prev => ({ ...prev, fontFamily: e.target.value }))}
            style={{ fontFamily: colors.fontFamily }}
          >
            {FONT_OPTIONS.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className="font-group">
          <label>Taille du texte</label>
          <select
            value={colors.fontSize}
            onChange={(e) => setColors(prev => ({ ...prev, fontSize: e.target.value }))}
          >
            {FONT_SIZE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="font-group">
          <label>Graisse du texte</label>
          <select
            value={colors.fontWeight}
            onChange={(e) => setColors(prev => ({ ...prev, fontWeight: e.target.value }))}
          >
            {FONT_WEIGHT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="font-preview-box" style={{ fontFamily: colors.fontFamily, fontSize: colors.fontSize, fontWeight: colors.fontWeight }}>
          Apercu du texte avec la police, taille et graisse choisies
        </div>
      </div>

      <div className="preview-section">
        <h2>Apercu</h2>
        <div className="preview-card">
          <div className="preview-heading" style={{ color: colors.headingColor }}>
            Titre de la page
          </div>
          <div className="preview-subtitle" style={{ color: colors.subtitleColor, fontFamily: colors.fontFamily, fontSize: colors.fontSize, fontWeight: colors.fontWeight }}>
            Sous-titre ou texte secondaire
          </div>
          <div className="preview-text" style={{ color: colors.textColor, fontFamily: colors.fontFamily, fontSize: colors.fontSize, fontWeight: colors.fontWeight }}>
            Ceci est un exemple de texte courant qui apparait sur les pages publiques du site.
            Les couleurs choisies seront appliquees sur l'ensemble du site.
          </div>
          <button
            className="preview-button"
            style={{ backgroundColor: colors.buttonBg, color: colors.buttonText }}
          >
            Bouton exemple
          </button>
          <div
            className="preview-announcement"
            style={{ background: colors.announcementBg, padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}
          >
            <span style={{ color: colors.headingColor, fontWeight: 500 }}>Section Annonces</span>
          </div>
          <div
            className="preview-cta"
            style={{ background: colors.ctaBg, padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', color: 'white', textAlign: 'center' }}
          >
            <span style={{ fontWeight: 500 }}>Section Sur Mesure</span>
          </div>
        </div>
      </div>

      <div className="color-actions">
        <button
          className="btn-reset-colors"
          onClick={handleReset}
        >
          Reinitialiser
        </button>
        <button
          className="btn-save-colors"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

export default AdminColors

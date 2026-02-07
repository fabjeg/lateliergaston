import { useState, useEffect } from 'react'
import { getSurmesureConfig, updateSurmesureConfig } from '../../services/surmesureApi'
import ConfirmModal from '../../components/admin/ConfirmModal'
import BackButton from '../../components/BackButton'
import Loader from '../../components/Loader'
import './AdminSurMesure.css'

const ICON_OPTIONS = [
  { key: 'hair', label: 'Cheveux' },
  { key: 'animal', label: 'Animal' },
  { key: 'baby', label: 'Bébé' },
  { key: 'diamond', label: 'Diamant' },
  { key: 'brush', label: 'Pinceau' },
  { key: 'scissors', label: 'Ciseaux' },
  { key: 'photo', label: 'Photo' },
  { key: 'art', label: 'Art / Palette' }
]

function getIconSvg(key) {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (key) {
    case 'hair':
      return <svg {...props}><path d="M12 2C8 2 6 5 6 8c0 2 1 4 2 5.5C9 15 10 17 10 19v3h4v-3c0-2 1-4 2-5.5 1-1.5 2-3.5 2-5.5 0-3-2-6-6-6z"/><path d="M10 22h4"/><path d="M12 2v4"/></svg>
    case 'animal':
      return <svg {...props}><circle cx="12" cy="10" r="7"/><path d="M8.5 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5"/><path d="M12.5 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5"/><path d="M9 12h6"/><path d="M10 14c.6.6 1.3 1 2 1s1.4-.4 2-1"/><path d="M7 3l-2-1"/><path d="M17 3l2-1"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>
    case 'baby':
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 3c-1 0-2 .5-2.5 1"/><path d="M12 3c1 0 2 .5 2.5 1"/></svg>
    case 'diamond':
      return <svg {...props}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M10 3l-2 6 4 13 4-13-2-6"/></svg>
    case 'brush':
      return <svg {...props}><path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L14 13l-4 1 1-4z"/><path d="M11 15H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v0a2 2 0 0 0 2 2h4"/></svg>
    case 'scissors':
      return <svg {...props}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
    case 'photo':
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    case 'art':
      return <svg {...props}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>
  }
}

function AdminSurMesure() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [materiaux, setMateriaux] = useState([])
  const [tailles, setTailles] = useState([])
  const [newTaille, setNewTaille] = useState('')
  const [papiers, setPapiers] = useState([])
  const [cadreConfig, setCadreConfig] = useState({ enabled: true, note: '' })
  const [descriptionPlaceholder, setDescriptionPlaceholder] = useState('')
  const [collapsedSections, setCollapsedSections] = useState({
    materiaux: false,
    tailles: false,
    papiers: false,
    cadre: false,
    description: false
  })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    const result = await getSurmesureConfig()
    if (result.success && result.config) {
      setMateriaux(result.config.materiaux || [])
      setTailles(result.config.tailles || [])
      setPapiers(result.config.papiers || [])
      setCadreConfig(result.config.cadreConfig || { enabled: true, note: '' })
      setDescriptionPlaceholder(result.config.descriptionPlaceholder || '')
    }
    setLoading(false)
  }

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleFieldChange = (index, field, value) => {
    setMateriaux(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addMateriau = () => {
    const id = 'materiau-' + Date.now()
    setMateriaux(prev => [...prev, {
      id,
      title: '',
      description: '',
      explanation: '',
      icon: 'hair'
    }])
    setCollapsedSections(prev => ({ ...prev, materiaux: false }))
  }

  const removeMateriau = (index) => {
    setMateriaux(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  const moveMateriau = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= materiaux.length) return
    setMateriaux(prev => {
      const updated = [...prev]
      ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
      return updated
    })
  }

  const addTaille = () => {
    const val = newTaille.trim()
    if (!val) return
    if (tailles.includes(val)) return
    setTailles(prev => [...prev, val])
    setNewTaille('')
    setCollapsedSections(prev => ({ ...prev, tailles: false }))
  }

  const removeTaille = (index) => {
    setTailles(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  const handlePapierFieldChange = (index, field, value) => {
    setPapiers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addPapier = () => {
    const id = 'papier-' + Date.now()
    setPapiers(prev => [...prev, {
      id,
      title: '',
      description: '',
      icon: 'photo'
    }])
    setCollapsedSections(prev => ({ ...prev, papiers: false }))
  }

  const removePapier = (index) => {
    setPapiers(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  const movePapier = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= papiers.length) return
    setPapiers(prev => {
      const updated = [...prev]
      ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const result = await updateSurmesureConfig({ materiaux, tailles, papiers, cadreConfig, descriptionPlaceholder })

    if (result.success) {
      setMessage({ type: 'success', text: 'Configuration mise à jour !' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="admin-surmesure">
        <Loader text="Chargement de la configuration" />
      </div>
    )
  }

  return (
    <div className="admin-surmesure">
      <BackButton to="/admin/dashboard" />

      <h1>Page Sur-mesure</h1>
      <p className="surmesure-subtitle">
        Gérez les options proposées aux clients
      </p>

      {/* Stats bar */}
      <div className="dashboard-stats surmesure-stats">
        <div className="stat-card">
          <span className="stat-icon">🎨</span>
          <div className="stat-info">
            <p className="stat-number">{materiaux.length}</p>
            <p className="stat-label">matériaux</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📐</span>
          <div className="stat-info">
            <p className="stat-number">{tailles.length}</p>
            <p className="stat-label">tailles</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📄</span>
          <div className="stat-info">
            <p className="stat-number">{papiers.length}</p>
            <p className="stat-label">papiers</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{cadreConfig.enabled ? '✅' : '⛔'}</span>
          <div className="stat-info">
            <p className="stat-number">{cadreConfig.enabled ? 'Actif' : 'Inactif'}</p>
            <p className="stat-label">cadre</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Section Matériaux */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('materiaux')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.materiaux ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Matériaux</h2>
              <span className="badge-count">{materiaux.length}</span>
            </div>
          </div>
          <p className="section-help">Définissez les matériaux disponibles pour les créations sur-mesure.</p>

          {!collapsedSections.materiaux && (
            <div className="form-section-content">
              {materiaux.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">🎨</span>
                  <p>Aucun matériau configuré</p>
                  <p className="empty-state-hint">Ajoutez un matériau pour commencer</p>
                </div>
              ) : (
                <div className="materiau-list">
                  {materiaux.map((mat, index) => (
                    <div key={mat.id || index} className="materiau-item">
                      <div className="materiau-item-header">
                        <div className="materiau-item-header-left">
                          <div className="reorder-arrows">
                            <button
                              type="button"
                              className="reorder-btn"
                              onClick={() => moveMateriau(index, 'up')}
                              disabled={index === 0}
                              aria-label="Monter"
                            >
                              &#9650;
                            </button>
                            <button
                              type="button"
                              className="reorder-btn"
                              onClick={() => moveMateriau(index, 'down')}
                              disabled={index === materiaux.length - 1}
                              aria-label="Descendre"
                            >
                              &#9660;
                            </button>
                          </div>
                          <span className="item-preview-icon">{getIconSvg(mat.icon)}</span>
                          <h3>{mat.title || `Matériau ${index + 1}`}</h3>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-item"
                          onClick={() => setConfirmDelete({ type: 'materiau', index, label: mat.title || `Matériau ${index + 1}` })}
                          title="Supprimer"
                        >
                          &#10005;
                        </button>
                      </div>

                      <div className="materiau-fields">
                        <div className="materiau-field">
                          <label>Titre</label>
                          <input
                            type="text"
                            value={mat.title}
                            onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                            placeholder="Ex: Cheveux Artificiels"
                          />
                        </div>

                        <div className="materiau-field">
                          <label>Description courte</label>
                          <input
                            type="text"
                            value={mat.description}
                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                            placeholder="Ex: Fibres synthétiques de haute qualité"
                          />
                        </div>

                        <div className="materiau-field">
                          <label>Texte d'explication (visible au clic sur l'icône info)</label>
                          <textarea
                            value={mat.explanation}
                            onChange={(e) => handleFieldChange(index, 'explanation', e.target.value)}
                            placeholder="Texte détaillé visible quand le client clique sur l'icône ℹ..."
                            rows={3}
                          />
                        </div>

                        <div className="materiau-field">
                          <label>Icône</label>
                          <div className="icon-selector-enhanced">
                            {ICON_OPTIONS.map(opt => (
                              <button
                                key={opt.key}
                                type="button"
                                className={`icon-option-enhanced ${mat.icon === opt.key ? 'selected' : ''}`}
                                onClick={() => handleFieldChange(index, 'icon', opt.key)}
                              >
                                {getIconSvg(opt.key)}
                                <span className="icon-option-label">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn-add-materiau"
                onClick={addMateriau}
              >
                + Ajouter un matériau
              </button>
            </div>
          )}
        </div>

        {/* Section Tailles */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('tailles')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.tailles ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Tailles disponibles</h2>
              <span className="badge-count">{tailles.length}</span>
            </div>
          </div>
          <p className="section-help">Listez les formats de tailles proposés aux clients.</p>

          {!collapsedSections.tailles && (
            <div className="form-section-content">
              {tailles.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📐</span>
                  <p>Aucune taille configurée</p>
                  <p className="empty-state-hint">Ajoutez une taille pour commencer</p>
                </div>
              ) : (
                <div className="tailles-list">
                  {tailles.map((taille, index) => (
                    <div key={index} className="taille-item">
                      <span className="taille-label">{taille}</span>
                      <button
                        type="button"
                        className="btn-delete-item"
                        onClick={() => setConfirmDelete({ type: 'taille', index, label: taille })}
                        title="Supprimer"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="taille-add">
                <input
                  type="text"
                  value={newTaille}
                  onChange={(e) => setNewTaille(e.target.value)}
                  placeholder="Ex: 20x30 cm"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTaille() } }}
                />
                <button type="button" className="btn-add-taille" onClick={addTaille}>
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section Types de Papier */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('papiers')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.papiers ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Types de Papier</h2>
              <span className="badge-count">{papiers.length}</span>
            </div>
          </div>
          <p className="section-help">Configurez les types de papier pour l'impression des oeuvres.</p>

          {!collapsedSections.papiers && (
            <div className="form-section-content">
              {papiers.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📄</span>
                  <p>Aucun type de papier configuré</p>
                  <p className="empty-state-hint">Ajoutez un type de papier pour commencer</p>
                </div>
              ) : (
                <div className="materiau-list">
                  {papiers.map((pap, index) => (
                    <div key={pap.id || index} className="materiau-item">
                      <div className="materiau-item-header">
                        <div className="materiau-item-header-left">
                          <div className="reorder-arrows">
                            <button
                              type="button"
                              className="reorder-btn"
                              onClick={() => movePapier(index, 'up')}
                              disabled={index === 0}
                              aria-label="Monter"
                            >
                              &#9650;
                            </button>
                            <button
                              type="button"
                              className="reorder-btn"
                              onClick={() => movePapier(index, 'down')}
                              disabled={index === papiers.length - 1}
                              aria-label="Descendre"
                            >
                              &#9660;
                            </button>
                          </div>
                          <span className="item-preview-icon">{getIconSvg(pap.icon)}</span>
                          <h3>{pap.title || `Papier ${index + 1}`}</h3>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-item"
                          onClick={() => setConfirmDelete({ type: 'papier', index, label: pap.title || `Papier ${index + 1}` })}
                          title="Supprimer"
                        >
                          &#10005;
                        </button>
                      </div>

                      <div className="materiau-fields">
                        <div className="materiau-field">
                          <label>Titre</label>
                          <input
                            type="text"
                            value={pap.title}
                            onChange={(e) => handlePapierFieldChange(index, 'title', e.target.value)}
                            placeholder="Ex: Papier Photo"
                          />
                        </div>

                        <div className="materiau-field">
                          <label>Description courte</label>
                          <input
                            type="text"
                            value={pap.description}
                            onChange={(e) => handlePapierFieldChange(index, 'description', e.target.value)}
                            placeholder="Ex: Finition brillante et détails nets"
                          />
                        </div>

                        <div className="materiau-field">
                          <label>Icône</label>
                          <div className="icon-selector-enhanced">
                            {ICON_OPTIONS.map(opt => (
                              <button
                                key={opt.key}
                                type="button"
                                className={`icon-option-enhanced ${pap.icon === opt.key ? 'selected' : ''}`}
                                onClick={() => handlePapierFieldChange(index, 'icon', opt.key)}
                              >
                                {getIconSvg(opt.key)}
                                <span className="icon-option-label">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn-add-materiau"
                onClick={addPapier}
              >
                + Ajouter un type de papier
              </button>
            </div>
          )}
        </div>

        {/* Section Option Cadre */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('cadre')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.cadre ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Option Cadre</h2>
              <span className={`badge-status ${cadreConfig.enabled ? 'active' : 'inactive'}`}>
                {cadreConfig.enabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <p className="section-help">Activez ou désactivez l'option cadre proposée aux clients.</p>

          {!collapsedSections.cadre && (
            <div className="form-section-content">
              <div className="cadre-config-toggle">
                <label className="cadre-admin-toggle">
                  <input
                    type="checkbox"
                    checked={cadreConfig.enabled}
                    onChange={(e) => setCadreConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-label-text">
                    {cadreConfig.enabled ? 'Section cadre activée' : 'Section cadre désactivée'}
                  </span>
                </label>
              </div>
              {cadreConfig.enabled && (
                <div className="materiau-field cadre-note-field">
                  <label>Note affichée quand le cadre est coché</label>
                  <input
                    type="text"
                    value={cadreConfig.note}
                    onChange={(e) => setCadreConfig(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Ex: Un cadre élégant sera sélectionné pour mettre en valeur votre œuvre."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section Texte d'aide description */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('description')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.description ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Texte d'aide (section 7)</h2>
            </div>
          </div>
          <p className="section-help">Personnalisez le texte indicatif affiché dans le champ "Décrivez votre projet".</p>

          {!collapsedSections.description && (
            <div className="form-section-content">
              <div className="materiau-field">
                <label>Placeholder du champ description</label>
                <textarea
                  value={descriptionPlaceholder}
                  onChange={(e) => setDescriptionPlaceholder(e.target.value)}
                  placeholder="Ex: Décrivez votre vision, vos souhaits particuliers, les dimensions souhaitées..."
                  rows={3}
                />
              </div>
              {descriptionPlaceholder && (
                <div className="placeholder-preview">
                  <span className="placeholder-preview-label">Aperçu :</span>
                  <span className="placeholder-preview-text">{descriptionPlaceholder}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onConfirm={() => {
          if (!confirmDelete) return
          if (confirmDelete.type === 'materiau') removeMateriau(confirmDelete.index)
          else if (confirmDelete.type === 'taille') removeTaille(confirmDelete.index)
          else if (confirmDelete.type === 'papier') removePapier(confirmDelete.index)
        }}
        onCancel={() => setConfirmDelete(null)}
        title="Supprimer cet élément"
        message={confirmDelete ? `Voulez-vous vraiment supprimer "${confirmDelete.label}" ?` : ''}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}

export default AdminSurMesure

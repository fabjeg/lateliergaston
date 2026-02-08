import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../../services/settingsApi'
import ConfirmModal from '../../components/admin/ConfirmModal'
import BackButton from '../../components/BackButton'
import Loader from '../../components/Loader'
import './AdminShopFilters.css'

const DEFAULT_FILTERS = {
  enableCategoryFilter: true,
  enablePriceFilter: true,
  enableSizeFilter: true,
  priceRanges: [
    { label: 'Moins de 50 €', value: '0-50' },
    { label: '50 € - 100 €', value: '50-100' },
    { label: '100 € - 200 €', value: '100-200' },
    { label: 'Plus de 200 €', value: '200-' }
  ],
  sizeRanges: [
    { label: 'Petit (≤ 30 cm)', value: 'small', max: 30 },
    { label: 'Moyen (30-60 cm)', value: 'medium', min: 30, max: 60 },
    { label: 'Grand (> 60 cm)', value: 'large', min: 60 }
  ]
}

function AdminShopFilters() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [enableCategory, setEnableCategory] = useState(true)
  const [enablePrice, setEnablePrice] = useState(true)
  const [enableSize, setEnableSize] = useState(true)
  const [priceRanges, setPriceRanges] = useState([])
  const [sizeRanges, setSizeRanges] = useState([])
  const [collapsedSections, setCollapsedSections] = useState({
    toggles: false,
    price: false,
    size: false
  })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    const result = await getSettings()
    if (result.success) {
      const filters = result.settings.shopFilters || DEFAULT_FILTERS
      setEnableCategory(filters.enableCategoryFilter !== false)
      setEnablePrice(filters.enablePriceFilter !== false)
      setEnableSize(filters.enableSizeFilter !== false)
      setPriceRanges(filters.priceRanges || DEFAULT_FILTERS.priceRanges)
      setSizeRanges(filters.sizeRanges || DEFAULT_FILTERS.sizeRanges)
    }
    setLoading(false)
  }

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Price range helpers
  const parsePriceValue = (value) => {
    const parts = value.split('-')
    return { min: parts[0] ? Number(parts[0]) : '', max: parts[1] ? Number(parts[1]) : '' }
  }

  const buildPriceValue = (min, max) => {
    return `${min || 0}-${max || ''}`
  }

  const handlePriceRangeChange = (index, field, value) => {
    setPriceRanges(prev => {
      const updated = [...prev]
      if (field === 'label') {
        updated[index] = { ...updated[index], label: value }
      } else {
        const parsed = parsePriceValue(updated[index].value)
        if (field === 'min') parsed.min = value
        if (field === 'max') parsed.max = value
        updated[index] = { ...updated[index], value: buildPriceValue(parsed.min, parsed.max) }
      }
      return updated
    })
  }

  const addPriceRange = () => {
    setPriceRanges(prev => [...prev, { label: '', value: '0-' }])
    setCollapsedSections(prev => ({ ...prev, price: false }))
  }

  const removePriceRange = (index) => {
    setPriceRanges(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  // Size range helpers
  const handleSizeRangeChange = (index, field, value) => {
    setSizeRanges(prev => {
      const updated = [...prev]
      if (field === 'label' || field === 'value') {
        updated[index] = { ...updated[index], [field]: value }
      } else {
        updated[index] = { ...updated[index], [field]: value === '' ? undefined : Number(value) }
      }
      return updated
    })
  }

  const addSizeRange = () => {
    const id = 'size-' + Date.now()
    setSizeRanges(prev => [...prev, { label: '', value: id, min: undefined, max: undefined }])
    setCollapsedSections(prev => ({ ...prev, size: false }))
  }

  const removeSizeRange = (index) => {
    setSizeRanges(prev => prev.filter((_, i) => i !== index))
    setConfirmDelete(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const shopFilters = {
      enableCategoryFilter: enableCategory,
      enablePriceFilter: enablePrice,
      enableSizeFilter: enableSize,
      priceRanges,
      sizeRanges
    }

    const result = await updateSettings({ shopFilters })

    if (result.success) {
      setMessage({ type: 'success', text: 'Filtres mis à jour !' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="admin-shopfilters">
        <Loader text="Chargement des filtres" />
      </div>
    )
  }

  return (
    <div className="admin-shopfilters">
      <BackButton to="/admin/dashboard" />

      <h1>Filtres Boutique</h1>
      <p className="shopfilters-subtitle">
        Gérez les filtres affichés dans la boutique
      </p>

      {/* Stats bar */}
      <div className="dashboard-stats shopfilters-stats">
        <div className="stat-card">
          <span className="stat-icon">{enableCategory ? '✅' : '⛔'}</span>
          <div className="stat-info">
            <p className="stat-number">{enableCategory ? 'Actif' : 'Inactif'}</p>
            <p className="stat-label">catégorie</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{enablePrice ? '✅' : '⛔'}</span>
          <div className="stat-info">
            <p className="stat-number">{enablePrice ? 'Actif' : 'Inactif'}</p>
            <p className="stat-label">prix</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{enableSize ? '✅' : '⛔'}</span>
          <div className="stat-info">
            <p className="stat-number">{enableSize ? 'Actif' : 'Inactif'}</p>
            <p className="stat-label">taille</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <p className="stat-number">{priceRanges.length + sizeRanges.length}</p>
            <p className="stat-label">tranches</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Section Activation des filtres */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('toggles')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.toggles ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Activation des filtres</h2>
            </div>
          </div>
          <p className="section-help">Activez ou désactivez chaque type de filtre dans la boutique.</p>

          {!collapsedSections.toggles && (
            <div className="form-section-content">
              <div className="filter-toggles">
                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={enableCategory}
                    onChange={(e) => setEnableCategory(e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-label-text">
                    {enableCategory ? 'Filtre catégorie activé' : 'Filtre catégorie désactivé'}
                  </span>
                </label>

                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={enablePrice}
                    onChange={(e) => setEnablePrice(e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-label-text">
                    {enablePrice ? 'Filtre prix activé' : 'Filtre prix désactivé'}
                  </span>
                </label>

                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={enableSize}
                    onChange={(e) => setEnableSize(e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-label-text">
                    {enableSize ? 'Filtre taille activé' : 'Filtre taille désactivé'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Section Tranches de prix */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('price')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.price ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Tranches de prix</h2>
              <span className="badge-count">{priceRanges.length}</span>
            </div>
          </div>
          <p className="section-help">Définissez les tranches de prix proposées dans le filtre.</p>

          {!collapsedSections.price && (
            <div className="form-section-content">
              {priceRanges.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">💰</span>
                  <p>Aucune tranche de prix configurée</p>
                  <p className="empty-state-hint">Ajoutez une tranche pour commencer</p>
                </div>
              ) : (
                <div className="range-list">
                  {priceRanges.map((range, index) => {
                    const parsed = parsePriceValue(range.value)
                    return (
                      <div key={index} className="range-item">
                        <div className="range-item-header">
                          <h3>{range.label || `Tranche ${index + 1}`}</h3>
                          <button
                            type="button"
                            className="btn-delete-item"
                            onClick={() => setConfirmDelete({ type: 'price', index, label: range.label || `Tranche ${index + 1}` })}
                            title="Supprimer"
                          >
                            &#10005;
                          </button>
                        </div>
                        <div className="range-fields">
                          <div className="range-field">
                            <label>Label</label>
                            <input
                              type="text"
                              value={range.label}
                              onChange={(e) => handlePriceRangeChange(index, 'label', e.target.value)}
                              placeholder="Ex: Moins de 50 €"
                            />
                          </div>
                          <div className="range-field-row">
                            <div className="range-field">
                              <label>Min (€)</label>
                              <input
                                type="number"
                                value={parsed.min}
                                onChange={(e) => handlePriceRangeChange(index, 'min', e.target.value)}
                                placeholder="0"
                                min="0"
                              />
                            </div>
                            <div className="range-field">
                              <label>Max (€)</label>
                              <input
                                type="number"
                                value={parsed.max}
                                onChange={(e) => handlePriceRangeChange(index, 'max', e.target.value)}
                                placeholder="Illimité"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                type="button"
                className="btn-add-range"
                onClick={addPriceRange}
              >
                + Ajouter une tranche de prix
              </button>
            </div>
          )}
        </div>

        {/* Section Tranches de taille */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('size')}>
            <div className="form-section-header-left">
              <span className={`chevron ${collapsedSections.size ? 'collapsed' : ''}`}>&#9660;</span>
              <h2>Tranches de taille</h2>
              <span className="badge-count">{sizeRanges.length}</span>
            </div>
          </div>
          <p className="section-help">Définissez les tranches de taille (en cm) proposées dans le filtre.</p>

          {!collapsedSections.size && (
            <div className="form-section-content">
              {sizeRanges.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📐</span>
                  <p>Aucune tranche de taille configurée</p>
                  <p className="empty-state-hint">Ajoutez une tranche pour commencer</p>
                </div>
              ) : (
                <div className="range-list">
                  {sizeRanges.map((range, index) => (
                    <div key={index} className="range-item">
                      <div className="range-item-header">
                        <h3>{range.label || `Tranche ${index + 1}`}</h3>
                        <button
                          type="button"
                          className="btn-delete-item"
                          onClick={() => setConfirmDelete({ type: 'size', index, label: range.label || `Tranche ${index + 1}` })}
                          title="Supprimer"
                        >
                          &#10005;
                        </button>
                      </div>
                      <div className="range-fields">
                        <div className="range-field">
                          <label>Label</label>
                          <input
                            type="text"
                            value={range.label}
                            onChange={(e) => handleSizeRangeChange(index, 'label', e.target.value)}
                            placeholder="Ex: Petit (≤ 30 cm)"
                          />
                        </div>
                        <div className="range-field">
                          <label>Identifiant</label>
                          <input
                            type="text"
                            value={range.value}
                            onChange={(e) => handleSizeRangeChange(index, 'value', e.target.value)}
                            placeholder="Ex: small"
                          />
                        </div>
                        <div className="range-field-row">
                          <div className="range-field">
                            <label>Min (cm)</label>
                            <input
                              type="number"
                              value={range.min ?? ''}
                              onChange={(e) => handleSizeRangeChange(index, 'min', e.target.value)}
                              placeholder="Aucun"
                              min="0"
                            />
                          </div>
                          <div className="range-field">
                            <label>Max (cm)</label>
                            <input
                              type="number"
                              value={range.max ?? ''}
                              onChange={(e) => handleSizeRangeChange(index, 'max', e.target.value)}
                              placeholder="Aucun"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn-add-range"
                onClick={addSizeRange}
              >
                + Ajouter une tranche de taille
              </button>
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
          if (confirmDelete.type === 'price') removePriceRange(confirmDelete.index)
          else if (confirmDelete.type === 'size') removeSizeRange(confirmDelete.index)
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

export default AdminShopFilters

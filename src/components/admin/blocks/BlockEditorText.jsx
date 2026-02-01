import { useState, useEffect } from 'react'
import { uploadImage } from '../../../services/productApi'
import { getAllCollections } from '../../../services/collectionApi'
import ConfirmModal from '../ConfirmModal'
import ImagePickerModal from '../ImagePickerModal'
import BlockStyleEditor from './BlockStyleEditor'

function BlockEditorText({ block, onChange, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [collections, setCollections] = useState([])
  const [showPicker, setShowPicker] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const result = getAllCollections()
    if (result.success) setCollections(result.collections)
  }, [])

  const updateBlock = (updates) => {
    onChange(block.id, { ...block, ...updates })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return

    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = await uploadImage(reader.result, file.name)
      setUploading(false)
      if (result.success) {
        updateBlock({ image: result.url })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const charCount = (block.content || '').length

  return (
    <div className={`form-section block-editor ${!block.active ? 'block-inactive' : ''}`}>
      <div className="block-editor-header" onClick={() => setCollapsed(c => !c)}>
        <div className="block-editor-header-left">
          <span className={`block-editor-chevron ${collapsed ? 'collapsed' : ''}`}>&#9660;</span>
          <span className="block-editor-type-badge badge-text">Texte</span>
          <h2>{block.title || 'Sans titre'}</h2>
          {!block.active && <span className="block-editor-hidden-badge">Masque</span>}
        </div>
        <div className="block-editor-header-right" onClick={(e) => e.stopPropagation()}>
          <label className="block-editor-toggle">
            <input
              type="checkbox"
              checked={block.active}
              onChange={(e) => updateBlock({ active: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
          <button type="button" className="btn-delete-block" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="block-editor-body">
          <div className="form-group">
            <label>Titre du bloc</label>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => updateBlock({ title: e.target.value })}
              placeholder="Titre du bloc texte"
            />
          </div>

          <div className="form-group">
            <label>Image (optionnel)</label>
            {block.image ? (
              <div className="block-image-preview">
                <img src={block.image} alt="" />
                <div className="block-image-preview-actions">
                  <button type="button" className="btn-change-image" onClick={() => updateBlock({ image: '' })}>
                    Retirer l'image
                  </button>
                </div>
              </div>
            ) : (
              <div className="image-source-buttons">
                <label className="block-card-upload">
                  <input
                    type="file"
                    accept="image/webp,image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading ? 'Upload...' : '+ Uploader'}
                </label>
                <button type="button" className="btn-pick-image" onClick={() => setShowPicker(true)}>
                  Bibliotheque
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              Contenu
              {charCount > 0 && <span className="char-count">{charCount} caracteres</span>}
            </label>
            <textarea
              value={block.content || ''}
              onChange={(e) => updateBlock({ content: e.target.value })}
              rows={6}
              placeholder="Texte du bloc (saut de ligne = nouveau paragraphe)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bouton - destination</label>
              <select
                value={block.link || ''}
                onChange={(e) => updateBlock({ link: e.target.value })}
              >
                <option value="">Aucun bouton</option>
                <optgroup label="Pages">
                  <option value="/shop">Boutique</option>
                  <option value="/gallery">Galerie (toutes)</option>
                  <option value="/sur-mesure">Sur-mesure</option>
                  <option value="/about">A propos</option>
                  <option value="/contact">Contact</option>
                </optgroup>
                {collections.length > 0 && (
                  <optgroup label="Galerie par collection">
                    {collections.map(c => (
                      <option key={c.id} value={`/gallery?collection=${c.id}`}>
                        Galerie : {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Texte du bouton</label>
              <input
                type="text"
                value={block.linkText || ''}
                onChange={(e) => updateBlock({ linkText: e.target.value })}
                placeholder="Decouvrir"
                disabled={!block.link}
              />
            </div>
          </div>

          <details className="block-style-details">
            <summary>Personnaliser l'apparence</summary>
            <BlockStyleEditor
              style={block.style || {}}
              onChange={(style) => updateBlock({ style })}
              showText={true}
            />
          </details>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onConfirm={() => { setConfirmDelete(false); onDelete(block.id) }}
        onCancel={() => setConfirmDelete(false)}
        title="Supprimer ce bloc"
        message={`Voulez-vous vraiment supprimer le bloc "${block.title || 'Texte'}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <ImagePickerModal
        isOpen={showPicker}
        onSelect={(url) => updateBlock({ image: url })}
        onClose={() => setShowPicker(false)}
      />
    </div>
  )
}

export default BlockEditorText

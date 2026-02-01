import { useState } from 'react'
import { uploadImage } from '../../../services/productApi'
import ConfirmModal from '../ConfirmModal'
import ImagePickerModal from '../ImagePickerModal'
import BlockStyleEditor from './BlockStyleEditor'

function BlockEditorCarousel({ block, onChange, onDelete }) {
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
        updateBlock({ images: [...(block.images || []), result.url] })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removeImage = (index) => {
    updateBlock({ images: (block.images || []).filter((_, i) => i !== index) })
  }

  const moveImage = (index, direction) => {
    const images = [...(block.images || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return
    ;[images[index], images[newIndex]] = [images[newIndex], images[index]]
    updateBlock({ images })
  }

  const imageCount = (block.images || []).length

  return (
    <div className={`form-section block-editor ${!block.active ? 'block-inactive' : ''}`}>
      <div className="block-editor-header" onClick={() => setCollapsed(c => !c)}>
        <div className="block-editor-header-left">
          <span className={`block-editor-chevron ${collapsed ? 'collapsed' : ''}`}>&#9660;</span>
          <span className="block-editor-type-badge badge-carousel">Carousel</span>
          <h2>{block.title || 'Sans titre'}</h2>
          <span className="block-editor-count">{imageCount} image{imageCount !== 1 ? 's' : ''}</span>
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
              placeholder="Titre du carousel"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={block.autoplay ?? true}
                  onChange={(e) => updateBlock({ autoplay: e.target.checked })}
                />
                <span>Lecture automatique</span>
              </label>
            </div>
            <div className="form-group">
              <label>Intervalle (secondes)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={block.interval ?? 5}
                onChange={(e) => {
                  const val = e.target.value
                  updateBlock({ interval: val === '' ? '' : (parseInt(val) || 1) })
                }}
                onBlur={() => {
                  if (!block.interval || block.interval < 1) updateBlock({ interval: 5 })
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Images du carousel ({imageCount})</label>
            <div className="art-images-grid">
              {(block.images || []).map((image, index) => (
                <div key={index} className="art-image-item">
                  <img src={image} alt={`Slide ${index + 1}`} />
                  <div className="art-image-actions">
                    <button
                      type="button"
                      className="art-image-move"
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                    >
                      &#8249;
                    </button>
                    <button
                      type="button"
                      className="art-image-remove"
                      onClick={() => removeImage(index)}
                    >
                      &#10005;
                    </button>
                    <button
                      type="button"
                      className="art-image-move"
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === (block.images || []).length - 1}
                    >
                      &#8250;
                    </button>
                  </div>
                  <span className="art-image-number">{index + 1}</span>
                </div>
              ))}

              <label className="art-image-add">
                <input
                  type="file"
                  accept="image/webp,image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <span className="uploading-text">Upload...</span>
                ) : (
                  <>
                    <span className="add-icon">+</span>
                    <span>Uploader</span>
                  </>
                )}
              </label>

              <div className="art-image-add" onClick={() => setShowPicker(true)} role="button" tabIndex={0}>
                <span className="add-icon">&#x1f5bc;</span>
                <span>Bibliotheque</span>
              </div>
            </div>
          </div>

          <details className="block-style-details">
            <summary>Personnaliser l'apparence</summary>
            <BlockStyleEditor
              style={block.style || {}}
              onChange={(style) => updateBlock({ style })}
              showText={false}
            />
          </details>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onConfirm={() => { setConfirmDelete(false); onDelete(block.id) }}
        onCancel={() => setConfirmDelete(false)}
        title="Supprimer ce bloc"
        message={`Voulez-vous vraiment supprimer le bloc "${block.title || 'Carousel'}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <ImagePickerModal
        isOpen={showPicker}
        onSelect={(url) => updateBlock({ images: [...(block.images || []), url] })}
        onClose={() => setShowPicker(false)}
      />
    </div>
  )
}

export default BlockEditorCarousel

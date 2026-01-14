import { useState } from 'react'
import './ImageUploader.css'

function ImageUploader({ onImageSelect, currentImage, disabled }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setError('')

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setError('L\'image doit faire moins de 500KB')
      return
    }

    // Read file and convert to base64
    const reader = new FileReader()

    reader.onloadend = () => {
      const base64 = reader.result
      setPreview(base64)
      onImageSelect({
        base64,
        filename: file.name
      })
    }

    reader.onerror = () => {
      setError('Erreur lors de la lecture du fichier')
    }

    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    onImageSelect(null)
  }

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">Image de l'œuvre *</label>

      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          {!disabled && (
            <div className="image-preview-actions">
              <button
                type="button"
                onClick={handleRemove}
                className="image-remove-btn"
              >
                ✕ Retirer
              </button>
              <label htmlFor="image-upload-input-change" className="image-change-btn">
                🔄 Changer
              </label>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                disabled={disabled}
                id="image-upload-input-change"
                className="image-upload-input"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="image-upload-zone">
          <input
            type="file"
            accept="image/webp,image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            disabled={disabled}
            id="image-upload-input"
            className="image-upload-input"
          />
          <label htmlFor="image-upload-input" className="image-upload-label">
            <div className="upload-icon">📷</div>
            <p>Cliquez pour sélectionner une image</p>
            <p className="upload-hint">WebP, JPEG ou PNG - Max 500KB</p>
          </label>
        </div>
      )}

      {error && <p className="image-uploader-error">{error}</p>}

      <p className="image-uploader-note">
        Pour de meilleures performances, utilisez des images WebP optimisées.
      </p>
    </div>
  )
}

export default ImageUploader

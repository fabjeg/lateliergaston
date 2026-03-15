import { useState } from 'react'
import { uploadImage } from '../../services/productApi'
import { validateImageFile } from '../../utils/imageValidation'
import ImagePickerModal from './ImagePickerModal'
import './ImageUploader.css'

function ImageUploader({ onImageSelect, currentImage, disabled }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    setError('')

    if (!file) return

    const validation = validateImageFile(file, 5)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    // Show preview locally
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setUploading(true)

    // Upload File directly to Cloudinary (bypasses Vercel body size limit)
    const result = await uploadImage(file, file.name)

    setUploading(false)

    if (result.success) {
      onImageSelect({
        url: result.url,
        publicId: result.publicId,
        filename: file.name
      })
    } else {
      setError(result.error || 'Erreur lors de l\'upload')
      setPreview(null)
      onImageSelect(null)
    }
  }

  const handlePickerSelect = (url) => {
    setPreview(url)
    setError('')
    onImageSelect({ url, publicId: null, filename: null })
  }

  const handleRemove = () => {
    setPreview(null)
    setError('')
    onImageSelect(null)
  }

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">Image de l'oeuvre *</label>

      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          {uploading && (
            <div className="image-uploading-overlay">
              <div className="uploading-spinner"></div>
              <span>Upload en cours...</span>
            </div>
          )}
          {!disabled && !uploading && (
            <div className="image-preview-actions">
              <button
                type="button"
                onClick={handleRemove}
                className="image-remove-btn"
              >
                Retirer
              </button>
              <label htmlFor="image-upload-input-change" className="image-change-btn">
                Changer
              </label>
              <input
                type="file"
                accept="image/webp,image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                disabled={disabled || uploading}
                id="image-upload-input-change"
                className="image-upload-input"
              />
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="image-library-btn"
              >
                Bibliothèque
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="image-upload-zone">
          <input
            type="file"
            accept="image/webp,image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            id="image-upload-input"
            className="image-upload-input"
          />
          <label htmlFor="image-upload-input" className="image-upload-label">
            <div className="upload-icon">📷</div>
            <p>Cliquez pour sélectionner une image</p>
            <p className="upload-hint">WebP, JPEG ou PNG - Max 5MB</p>
          </label>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            disabled={disabled}
            className="image-library-btn image-library-btn--standalone"
          >
            Ou choisir depuis la bibliothèque Cloudinary
          </button>
        </div>
      )}

      {error && <p className="image-uploader-error">{error}</p>}

      <p className="image-uploader-note">
        Les images sont optimisées automatiquement pour le web.
      </p>

      <ImagePickerModal
        isOpen={showPicker}
        onSelect={handlePickerSelect}
        onClose={() => setShowPicker(false)}
      />
    </div>
  )
}

export default ImageUploader

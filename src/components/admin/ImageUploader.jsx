import { useState } from 'react'
import { uploadImage } from '../../services/productApi'
import './ImageUploader.css'

function ImageUploader({ onImageSelect, currentImage, disabled }) {
  const [preview, setPreview] = useState(currentImage || null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    setError('')

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide')
      return
    }

    // Validate file size (max 5MB for Cloudinary)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB')
      return
    }

    // Read file and convert to base64 for preview and upload
    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64 = reader.result
      setPreview(base64)
      setUploading(true)

      // Upload to Cloudinary
      const result = await uploadImage(base64, file.name)

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
        </div>
      )}

      {error && <p className="image-uploader-error">{error}</p>}

      <p className="image-uploader-note">
        Les images sont optimisées automatiquement pour le web.
      </p>
    </div>
  )
}

export default ImageUploader

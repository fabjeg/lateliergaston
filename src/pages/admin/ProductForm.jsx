import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ImageUploader from '../../components/admin/ImageUploader'
import { createProduct, updateProduct, getProduct } from '../../services/productApi'
import './ProductForm.css'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    height: '',
    width: '',
    stripePriceId: '',
    status: 'available'
  })

  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingProduct, setLoadingProduct] = useState(isEditMode)

  // Load product if in edit mode
  useEffect(() => {
    if (isEditMode) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    setLoadingProduct(true)
    const result = await getProduct(id)

    if (result.success) {
      const product = result.product
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        height: product.height?.toString() || '',
        width: product.width?.toString() || '',
        stripePriceId: product.stripePriceId || '',
        status: product.status
      })
      setImage({ base64: product.imageBase64, filename: product.imageFilename })
    } else {
      setError(result.error || 'Erreur lors du chargement du produit')
    }

    setLoadingProduct(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (imageData) => {
    setImage(imageData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.name || !formData.price || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    // Image required only for creation
    if (!isEditMode && !image) {
      setError('Veuillez sélectionner une image')
      setLoading(false)
      return
    }

    // Prepare data
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      height: formData.height ? parseFloat(formData.height) : null,
      width: formData.width ? parseFloat(formData.width) : null
    }

    // Only include image if it was changed
    if (image && image.base64) {
      productData.imageBase64 = image.base64
      productData.imageFilename = image.filename
    }

    // Create or update
    const result = isEditMode
      ? await updateProduct(id, productData)
      : await createProduct(productData)

    if (result.success) {
      navigate('/admin/products')
    } else {
      setError(result.error || 'Erreur lors de l\'enregistrement')
    }

    setLoading(false)
  }

  if (loadingProduct) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>{isEditMode ? 'Modifier' : 'Créer'} une œuvre</h1>
          </div>
        </div>
        <div className="admin-content">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>{isEditMode ? 'Modifier' : 'Créer'} une œuvre</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="product-form-container">
          <form onSubmit={handleSubmit} className="product-form">
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Nom de l'œuvre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Œuvre 11"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Prix (€) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                placeholder="450.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin."
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="height">Hauteur (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="30"
                  step="0.1"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="width">Largeur (cm)</label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="40"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <ImageUploader
              onImageSelect={handleImageSelect}
              currentImage={image?.base64}
              disabled={loading}
            />

            <div className="form-group">
              <label htmlFor="stripePriceId">Stripe Price ID (optionnel)</label>
              <input
                type="text"
                id="stripePriceId"
                name="stripePriceId"
                value={formData.stripePriceId}
                onChange={handleChange}
                disabled={loading}
                placeholder="price_..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Statut</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="available">Disponible</option>
                <option value="sold">Vendu</option>
                <option value="hidden">Caché</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                disabled={loading}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductForm

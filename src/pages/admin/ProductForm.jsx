import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ImageUploader from '../../components/admin/ImageUploader'
import { createProduct, updateProduct, getProduct } from '../../services/productApi'
import { getAllCollections } from '../../services/collectionApi'
import BackButton from '../../components/BackButton'
import './ProductForm.css'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [collections, setCollections] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    height: '',
    width: '',
    technique: 'broderie-photo',
    year: new Date().getFullYear().toString(),
    framed: 'non',
    stripePriceId: '',
    status: 'available',
    collectionId: ''
  })

  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingProduct, setLoadingProduct] = useState(isEditMode)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load collections
  useEffect(() => {
    const result = getAllCollections()
    if (result.success) {
      setCollections(result.collections)
    }
  }, [])

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
        technique: product.technique || 'broderie-photo',
        year: product.year?.toString() || new Date().getFullYear().toString(),
        framed: product.framed || 'non',
        stripePriceId: product.stripePriceId || '',
        status: product.status,
        collectionId: product.collectionId || ''
      })
      // Support both Cloudinary URLs and legacy base64
      setImage({
        url: product.imageUrl || null,
        publicId: product.imagePublicId || null,
        filename: product.imageFilename,
        preview: product.image // URL or base64 for display
      })
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
      width: formData.width ? parseFloat(formData.width) : null,
      year: formData.year ? parseInt(formData.year) : null
    }

    // Only include image if it was changed (new Cloudinary URL)
    if (image && image.url) {
      productData.imageUrl = image.url
      productData.imagePublicId = image.publicId
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
            <h1>{isEditMode ? 'Modifier' : 'Nouvelle'} œuvre</h1>
          </div>
        </div>
        <div className="admin-content">
          <div className="loading-state">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>{isEditMode ? 'Modifier' : 'Nouvelle'} œuvre</h1>
          <p className="admin-subtitle">
            {isEditMode ? 'Modifiez les informations de votre œuvre' : 'Ajoutez une nouvelle création à votre boutique'}
          </p>
        </div>
      </div>

      <div className="admin-content">
        <BackButton to="/admin/products" label="Œuvres" />

        <form onSubmit={handleSubmit} className="product-form-layout">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* Colonne gauche - Image */}
          <div className="form-column-image">
            <div className="form-section">
              <h3 className="section-title">Photo de l'œuvre</h3>
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={image?.preview || image?.url}
                disabled={loading}
              />
            </div>
          </div>

          {/* Colonne droite - Informations */}
          <div className="form-column-info">
            {/* Section principale */}
            <div className="form-section">
              <h3 className="section-title">Informations principales</h3>

              <div className="form-group">
                <label htmlFor="name">Titre de l'œuvre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ex: Rêverie florale"
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
                  placeholder="Décrivez votre œuvre : inspiration, histoire, détails particuliers..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Prix de vente (€) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="450"
                  step="1"
                  min="0"
                />
              </div>
            </div>

            {/* Section détails */}
            <div className="form-section">
              <h3 className="section-title">Détails de l'œuvre</h3>

              <div className="form-group">
                <label htmlFor="collectionId">Collection</label>
                <select
                  id="collectionId"
                  name="collectionId"
                  value={formData.collectionId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">-- Aucune collection --</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="technique">Technique</label>
                  <select
                    id="technique"
                    name="technique"
                    value={formData.technique}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="broderie-photo">Broderie sur photographie</option>
                    <option value="broderie-toile">Broderie sur toile</option>
                    <option value="broderie-papier">Broderie sur papier</option>
                    <option value="autre">Autre technique</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="year">Année</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="2024"
                    min="1900"
                    max="2100"
                  />
                </div>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="framed">Encadrement</label>
                  <select
                    id="framed"
                    name="framed"
                    value={formData.framed}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="non">Sans cadre</option>
                    <option value="oui">Avec cadre</option>
                    <option value="option">Cadre en option</option>
                  </select>
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
                    <option value="hidden">Masqué</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section avancée */}
            <div className="form-section-advanced">
              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Options avancées {showAdvanced ? '▲' : '▼'}
              </button>

              {showAdvanced && (
                <div className="advanced-content">
                  <div className="form-group">
                    <label htmlFor="stripePriceId">Stripe Price ID</label>
                    <input
                      type="text"
                      id="stripePriceId"
                      name="stripePriceId"
                      value={formData.stripePriceId}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="price_..."
                    />
                    <span className="field-hint">Laissez vide pour génération automatique</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
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
                {loading ? 'Enregistrement...' : (isEditMode ? 'Enregistrer' : 'Publier l\'œuvre')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm

import { useState, useEffect } from 'react'
import { getAllProductsAdmin, reorderProducts } from '../../services/productApi'
import BackButton from '../../components/BackButton'
import Loader from '../../components/Loader'
import './AdminReorder.css'

function AdminReorder() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProductsAdmin()

    if (result.success) {
      // Sort by displayOrder
      const sorted = [...result.products].sort((a, b) =>
        (a.displayOrder || a.id) - (b.displayOrder || b.id)
      )
      setProducts(sorted)
    }

    setLoading(false)
  }

  const handleDragStart = (e, index) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.classList.add('dragging')
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging')
    setDraggedItem(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return

    const newProducts = [...products]
    const draggedProduct = newProducts[draggedItem]

    // Remove from old position
    newProducts.splice(draggedItem, 1)
    // Insert at new position
    newProducts.splice(index, 0, draggedProduct)

    setProducts(newProducts)
    setDraggedItem(index)
    setHasChanges(true)
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newProducts = [...products]
    ;[newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]]
    setProducts(newProducts)
    setHasChanges(true)
  }

  const handleMoveDown = (index) => {
    if (index === products.length - 1) return
    const newProducts = [...products]
    ;[newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]]
    setProducts(newProducts)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const orderedIds = products.map(p => p.id)
    const result = await reorderProducts(orderedIds)

    if (result.success) {
      setMessage({ type: 'success', text: 'Ordre enregistré avec succès !' })
      setHasChanges(false)
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'enregistrement' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleReset = () => {
    loadProducts()
    setHasChanges(false)
  }

  if (loading) {
    return (
      <div className="admin-reorder">
        <Loader text="Chargement des oeuvres" />
      </div>
    )
  }

  return (
    <div className="admin-reorder">
      <BackButton to="/admin/products" label="Oeuvres" />

      <div className="reorder-header">
        <h1>Réorganiser les oeuvres</h1>
        <p className="reorder-help">
          Glissez-déposez les oeuvres pour changer leur ordre d'affichage dans la boutique et la galerie.
        </p>
      </div>

      {message && (
        <div className={`reorder-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="reorder-list">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`reorder-item ${product.status === 'hidden' ? 'hidden-product' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <div className="reorder-handle">
              <span className="handle-icon">⋮⋮</span>
            </div>
            <div className="reorder-position">{index + 1}</div>
            <div className="reorder-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="reorder-info">
              <h3>{product.name}</h3>
              <span className={`reorder-status status-${product.status}`}>
                {product.status === 'available' && 'Disponible'}
                {product.status === 'sold' && 'Vendu'}
                {product.status === 'hidden' && 'Masqué'}
              </span>
            </div>
            <div className="reorder-arrows">
              <button
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className="arrow-btn"
                title="Monter"
              >
                ▲
              </button>
              <button
                onClick={() => handleMoveDown(index)}
                disabled={index === products.length - 1}
                className="arrow-btn"
                title="Descendre"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="reorder-actions">
        <button
          onClick={handleReset}
          className="btn-reset"
          disabled={!hasChanges || saving}
        >
          Annuler les changements
        </button>
        <button
          onClick={handleSave}
          className="btn-save"
          disabled={!hasChanges || saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer l\'ordre'}
        </button>
      </div>
    </div>
  )
}

export default AdminReorder

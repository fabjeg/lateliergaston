import { useParams } from 'react-router-dom'
import { useState } from 'react'
import './ProductDetail.css'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'
import { useInventory } from '../context/InventoryContext'
import SoldBadge from '../components/SoldBadge'

function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))
  const { addToCart, isInCart } = useCart()
  const { isSold, loading } = useInventory()
  const [showNotification, setShowNotification] = useState(false)
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return <div className="product-detail"><h2>Produit non trouvé</h2></div>
  }

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  const inCart = isInCart(product.id)
  const productIsSold = isSold(product.id)

  const handleAddToCart = () => {
    if (!productIsSold) {
      addToCart(product, quantity)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      setQuantity(1) // Reset quantity after adding
    }
  }

  return (
    <div className="product-detail">
      {showNotification && (
        <div className="notification">
          Produit ajouté au panier!
        </div>
      )}
      <div className="product-detail-grid">
        <div className="product-image">
          <div className="product-image-wrapper">
            <img src={product.image} alt={product.name} />
            {productIsSold && <SoldBadge />}
          </div>
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toFixed(2)} €</p>
          <p className="description">{product.description}</p>
          {productIsSold ? (
            <div className="sold-message">
              <p>Cette œuvre n'est plus disponible.</p>
              <p className="sold-note">Désactivée temporairement.</p>
            </div>
          ) : (
            <>
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantité:</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="add-to-cart"
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

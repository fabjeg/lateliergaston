import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './ProductDetail.css'
import { getProduct } from '../services/productApi'
import { useCart } from '../context/CartContext'
import { useInventory } from '../context/InventoryContext'
import SoldBadge from '../components/SoldBadge'
import Loader from '../components/Loader'
import SEO from '../components/SEO'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToCart, isInCart } = useCart()
  const { isSold } = useInventory()
  const [showNotification, setShowNotification] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    const result = await getProduct(id)

    if (result.success) {
      setProduct(result.product)
    } else {
      setError(result.error || 'Produit non trouvé')
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="product-detail">
        <Loader />
      </div>
    )
  }

  if (error || !product) {
    return <div className="product-detail"><h2>{error || 'Produit non trouvé'}</h2></div>
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
      <SEO
        title={product.name}
        description={product.description || `Découvrez ${product.name} - Œuvre unique brodée par L'Atelier Gaston. Prix : ${product.price.toFixed(2)} €`}
        url={`/product/${product.id}`}
        image={product.image}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
        }}
      />
      <button className="back-to-shop" onClick={handleBack}>
        <span className="back-arrow">&#8249;</span>
        <span>Retour</span>
      </button>

      {showNotification && (
        <div className="notification">
          Produit ajouté au panier!
        </div>
      )}
      <div className="product-detail-grid">
        <div className="product-image">
          <div className="product-image-wrapper">
            <img src={product.image} alt="" />
            {productIsSold && <SoldBadge />}
          </div>
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toFixed(2)} €</p>
          {(product.height || product.width) && (
            <p className="dimensions">
              Dimensions : {product.height && `${product.height} cm`}
              {product.height && product.width && ' × '}
              {product.width && `${product.width} cm`}
            </p>
          )}
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

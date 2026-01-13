import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { createCheckoutSession, validateCartForCheckout } from '../services/checkoutService'
import './Cart.css'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal } = useCart()
  const [shippingZone, setShippingZone] = useState('FR')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  // Shipping costs based on zone
  const shippingCosts = {
    FR: 15.00,
    EU: 25.00,
    WORLD: 40.00
  }

  const shippingCost = shippingCosts[shippingZone]
  const subtotal = getSubtotal()
  const total = subtotal + shippingCost

  const handleCheckout = async () => {
    setError(null)
    setIsProcessing(true)

    try {
      // Validate cart before proceeding
      const validation = validateCartForCheckout(cartItems)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        setIsProcessing(false)
        return
      }

      // Create Stripe checkout session and redirect
      await createCheckoutSession(cartItems, shippingZone)
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.')
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <h1>Panier</h1>
        <div className="cart-empty">
          <p>Votre panier est vide</p>
          <Link to="/shop" className="continue-shopping">
            Continuer mes achats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart">
      <h1>Panier</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">{item.price.toFixed(2)} € / pièce</p>
                <div className="cart-quantity-controls">
                  <label>Quantité:</label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="cart-item-subtotal">
                  Sous-total: {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
              <button
                className="remove-button"
                onClick={() => removeFromCart(item.id)}
                aria-label="Retirer du panier"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Résumé</h2>

          <div className="summary-row">
            <span>Sous-total ({cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'})</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>

          <div className="shipping-section">
            <label htmlFor="shipping-zone">Livraison</label>
            <select
              id="shipping-zone"
              value={shippingZone}
              onChange={(e) => setShippingZone(e.target.value)}
              className="shipping-select"
            >
              <option value="FR">France - {shippingCosts.FR.toFixed(2)} €</option>
              <option value="EU">Europe - {shippingCosts.EU.toFixed(2)} €</option>
              <option value="WORLD">Reste du monde - {shippingCosts.WORLD.toFixed(2)} €</option>
            </select>
          </div>

          <div className="summary-row">
            <span>Frais de livraison</span>
            <span>{shippingCost.toFixed(2)} €</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Redirection vers Stripe...' : 'Procéder au paiement'}
          </button>

          <Link to="/shop" className="continue-shopping-link">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Cart

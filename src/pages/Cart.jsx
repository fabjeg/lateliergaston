import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { createCheckoutSession, validateCartForCheckout } from '../services/checkoutService'
import { getSettings } from '../services/settingsApi'
import './Cart.css'

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getSubtotal } = useCart()
  const [shippingZone, setShippingZone] = useState('FR')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [shopEnabled, setShopEnabled] = useState(true)
  const [shippingCosts, setShippingCosts] = useState({
    FR: { label: 'Livraison France', amount: 15, enabled: true },
    EU: { label: 'Livraison Europe', amount: 25, enabled: true },
    WORLD: { label: 'Livraison Internationale', amount: 40, enabled: true },
  })
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    getSettings(true).then(result => {
      if (result.success) {
        setShopEnabled(result.settings.shopEnabled !== false)
        if (result.settings.shippingCosts) {
          const sc = result.settings.shippingCosts
          const costs = {
            FR: { label: sc.FR?.label || 'Livraison France', amount: (sc.FR?.amount || 1500) / 100, enabled: true },
            EU: { label: sc.EU?.label || 'Livraison Europe', amount: (sc.EU?.amount || 2500) / 100, enabled: sc.EU?.enabled !== false },
            WORLD: { label: sc.WORLD?.label || 'Livraison Internationale', amount: (sc.WORLD?.amount || 4000) / 100, enabled: sc.WORLD?.enabled !== false },
          }
          setShippingCosts(costs)
          // Si la zone selectionnee est desactivee, basculer sur FR
          if (!costs[shippingZone]?.enabled) {
            setShippingZone('FR')
          }
        }
      }
      setSettingsLoaded(true)
    })
  }, [])

  const shippingCost = shippingCosts[shippingZone]?.amount || 0
  const subtotal = getSubtotal()
  const total = subtotal + shippingCost

  const handleCheckout = async () => {
    setError(null)
    setIsProcessing(true)

    try {
      const validation = validateCartForCheckout(cartItems)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        setIsProcessing(false)
        return
      }

      await createCheckoutSession(cartItems, shippingZone)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Une erreur est survenue lors de la creation de la session de paiement. Veuillez reessayer.')
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
              {shippingCosts.FR.enabled && (
                <option value="FR">{shippingCosts.FR.label} - {shippingCosts.FR.amount.toFixed(2)} €</option>
              )}
              {shippingCosts.EU.enabled && (
                <option value="EU">{shippingCosts.EU.label} - {shippingCosts.EU.amount.toFixed(2)} €</option>
              )}
              {shippingCosts.WORLD.enabled && (
                <option value="WORLD">{shippingCosts.WORLD.label} - {shippingCosts.WORLD.amount.toFixed(2)} €</option>
              )}
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

          {!shopEnabled && (
            <div className="checkout-disabled-notice">
              <p>Les ventes en ligne sont actuellement suspendues</p>
              <p className="checkout-disabled-message">Vous pouvez nous contacter directement pour toute commande.</p>
            </div>
          )}

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={isProcessing || !shopEnabled}
          >
            {isProcessing ? 'Redirection...' : 'Procéder au paiement'}
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

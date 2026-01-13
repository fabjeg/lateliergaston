import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Success.css'

function Success() {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear cart after successful payment
    if (sessionId && !orderConfirmed) {
      clearCart()
      setOrderConfirmed(true)
    }
  }, [sessionId, clearCart, orderConfirmed])

  if (!sessionId) {
    return (
      <div className="success">
        <div className="success-content">
          <div className="error-icon">⚠️</div>
          <h1>Session invalide</h1>
          <p>Aucune session de paiement trouvée.</p>
          <Link to="/shop" className="button-primary">
            Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="success">
      <div className="success-content">
        <div className="success-icon">✓</div>
        <h1>Commande confirmée!</h1>
        <p className="success-message">
          Merci pour votre achat! Votre commande a été enregistrée avec succès.
        </p>

        <div className="order-info">
          <h2>Détails de la commande</h2>
          <div className="info-row">
            <span className="label">Numéro de commande:</span>
            <span className="value">{sessionId.slice(-12)}</span>
          </div>
          <div className="info-row">
            <span className="label">Statut:</span>
            <span className="value status-paid">Payé</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Prochaines étapes</h3>
          <ul>
            <li>Vous allez recevoir un email de confirmation à l'adresse fournie</li>
            <li>Votre commande sera préparée dans les prochains jours</li>
            <li>Vous recevrez un email avec le numéro de suivi de livraison</li>
          </ul>
        </div>

        <div className="success-actions">
          <Link to="/shop" className="button-primary">
            Continuer mes achats
          </Link>
          <Link to="/" className="button-secondary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Success

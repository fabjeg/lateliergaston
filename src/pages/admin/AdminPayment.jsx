import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../../services/settingsApi'
import { adminFetch } from '../../utils/adminFetch'
import BackButton from '../../components/BackButton'
import './AdminPayment.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

const DEFAULT_SHIPPING = {
  FR: { label: 'Livraison France', amount: 1500 },
  EU: { label: 'Livraison Europe', amount: 2500 },
  WORLD: { label: 'Livraison Internationale', amount: 4000 },
}

function AdminPayment() {
  const [shopEnabled, setShopEnabled] = useState(true)
  const [shopToggleLoading, setShopToggleLoading] = useState(false)
  const [shipping, setShipping] = useState({
    FR: { label: 'Livraison France', amount: 15, enabled: true },
    EU: { label: 'Livraison Europe', amount: 25, enabled: true },
    WORLD: { label: 'Livraison Internationale', amount: 40, enabled: true },
  })
  const [shippingSaving, setShippingSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
    loadOrders()
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  const loadSettings = async () => {
    const result = await getSettings(true)
    if (result.success) {
      setShopEnabled(result.settings.shopEnabled !== false)
      if (result.settings.shippingCosts) {
        const sc = result.settings.shippingCosts
        setShipping({
          FR: { label: sc.FR?.label || 'Livraison France', amount: (sc.FR?.amount || 1500) / 100, enabled: true },
          EU: { label: sc.EU?.label || 'Livraison Europe', amount: (sc.EU?.amount || 2500) / 100, enabled: sc.EU?.enabled !== false },
          WORLD: { label: sc.WORLD?.label || 'Livraison Internationale', amount: (sc.WORLD?.amount || 4000) / 100, enabled: sc.WORLD?.enabled !== false },
        })
      }
    }
    setLoading(false)
  }

  const loadOrders = async () => {
    try {
      const res = await adminFetch(`${API_BASE}/api/settings?type=orders`, { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        setOrders(data.data.orders)
      }
    } catch (err) {
      console.error('Error loading orders:', err)
    }
    setOrdersLoading(false)
  }

  const toggleShop = async () => {
    setShopToggleLoading(true)
    const newValue = !shopEnabled
    const result = await updateSettings({ shopEnabled: newValue })
    if (result.success) {
      setShopEnabled(newValue)
      setMessage({ type: 'success', text: newValue ? 'Ventes activees' : 'Ventes desactivees' })
    }
    setShopToggleLoading(false)
  }

  const handleShippingChange = (zone, field, value) => {
    setShipping(prev => ({
      ...prev,
      [zone]: { ...prev[zone], [field]: field === 'amount' ? value : value }
    }))
  }

  const saveShipping = async () => {
    setShippingSaving(true)
    const shippingCosts = {
      FR: { label: shipping.FR.label, amount: Math.round(Number(shipping.FR.amount) * 100), enabled: true },
      EU: { label: shipping.EU.label, amount: Math.round(Number(shipping.EU.amount) * 100), enabled: shipping.EU.enabled },
      WORLD: { label: shipping.WORLD.label, amount: Math.round(Number(shipping.WORLD.amount) * 100), enabled: shipping.WORLD.enabled },
    }
    const result = await updateSettings({ shippingCosts })
    if (result.success) {
      setMessage({ type: 'success', text: 'Frais de livraison mis a jour' })
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    }
    setShippingSaving(false)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatAmount = (amount, currency) => {
    return (amount / 100).toFixed(2) + ' ' + (currency || 'eur').toUpperCase()
  }

  if (loading) {
    return <div className="admin-payment"><p style={{ textAlign: 'center', padding: '4rem' }}>Chargement...</p></div>
  }

  return (
    <div className="admin-payment">
      <BackButton to="/admin/dashboard" />
      <h1>Paiement & Livraison</h1>

      {message && (
        <div className={`payment-message ${message.type}`}>{message.text}</div>
      )}

      {/* Section 1: Toggle ventes */}
      <section className="payment-section">
        <h2>Ventes en ligne</h2>
        <div className="shop-toggle-row">
          <span className="shop-toggle-status">
            {shopEnabled ? 'Les ventes sont actuellement activees' : 'Les ventes sont actuellement desactivees'}
          </span>
          <button
            className={`payment-toggle-btn ${shopEnabled ? 'active' : 'inactive'}`}
            onClick={toggleShop}
            disabled={shopToggleLoading}
          >
            {shopToggleLoading ? '...' : shopEnabled ? 'Activees' : 'Desactivees'}
          </button>
        </div>
      </section>

      {/* Section 2: Frais de livraison */}
      <section className="payment-section">
        <h2>Frais de livraison</h2>
        <div className="shipping-grid">
          {[
            { key: 'FR', emoji: '\uD83C\uDDEB\uD83C\uDDF7', zone: 'France', alwaysOn: true },
            { key: 'EU', emoji: '\uD83C\uDDEA\uD83C\uDDFA', zone: 'Europe', alwaysOn: false },
            { key: 'WORLD', emoji: '\uD83C\uDF0D', zone: 'International', alwaysOn: false },
          ].map(({ key, emoji, zone, alwaysOn }) => (
            <div key={key} className={`shipping-card ${!shipping[key].enabled ? 'shipping-card-disabled' : ''}`}>
              <div className="shipping-card-header">
                <span className="shipping-emoji">{emoji}</span>
                <span className="shipping-zone">{zone}</span>
                {!alwaysOn && (
                  <label className="shipping-toggle">
                    <input
                      type="checkbox"
                      checked={shipping[key].enabled}
                      onChange={(e) => handleShippingChange(key, 'enabled', e.target.checked)}
                    />
                    <span className="shipping-toggle-label">
                      {shipping[key].enabled ? 'Active' : 'Desactive'}
                    </span>
                  </label>
                )}
              </div>
              <div className="shipping-fields">
                <label>
                  <span>Label</span>
                  <input
                    type="text"
                    value={shipping[key].label}
                    onChange={(e) => handleShippingChange(key, 'label', e.target.value)}
                    disabled={!shipping[key].enabled}
                  />
                </label>
                <label>
                  <span>Montant</span>
                  <div className="shipping-amount-input">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shipping[key].amount}
                      onChange={(e) => handleShippingChange(key, 'amount', e.target.value)}
                      disabled={!shipping[key].enabled}
                    />
                    <span className="shipping-currency">&euro;</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn-save-shipping"
          onClick={saveShipping}
          disabled={shippingSaving}
        >
          {shippingSaving ? 'Sauvegarde...' : 'Enregistrer les frais'}
        </button>
      </section>

      {/* Section 3: Historique des commandes */}
      <section className="payment-section">
        <h2>Historique des commandes</h2>
        {ordersLoading ? (
          <p className="orders-loading">Chargement...</p>
        ) : orders.length === 0 ? (
          <p className="orders-empty">Aucune commande pour le moment.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Zone</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={order._id || i}>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="order-client">
                        <span className="order-name">{order.customerName || '-'}</span>
                        <span className="order-email">{order.customerEmail || '-'}</span>
                      </div>
                    </td>
                    <td className="order-amount">{formatAmount(order.amountTotal, order.currency)}</td>
                    <td><span className="order-zone">{order.shippingZone || '-'}</span></td>
                    <td>
                      <span className={`order-status ${order.status}`}>
                        {order.status === 'paid' ? 'Payee' : order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminPayment

import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CartIcon.css'

function CartIcon() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Link to="/cart" className="cart-icon-link" aria-label={`Panier${itemCount > 0 ? ` (${itemCount} article${itemCount > 1 ? 's' : ''})` : ''}`}>
      <div className="cart-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {itemCount > 0 && (
          <span className="cart-badge">{itemCount}</span>
        )}
      </div>
    </Link>
  )
}

export default CartIcon

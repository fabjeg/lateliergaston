import { Link } from 'react-router-dom'
import './Shop.css'

const products = [
  { id: 1, name: 'Création 1', price: 49.99, image: 'https://via.placeholder.com/300' },
  { id: 2, name: 'Création 2', price: 59.99, image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Création 3', price: 39.99, image: 'https://via.placeholder.com/300' },
  { id: 4, name: 'Création 4', price: 69.99, image: 'https://via.placeholder.com/300' },
  { id: 5, name: 'Création 5', price: 44.99, image: 'https://via.placeholder.com/300' },
  { id: 6, name: 'Création 6', price: 54.99, image: 'https://via.placeholder.com/300' },
]

function Shop() {
  return (
    <div className="shop">
      <h1>Notre Boutique</h1>
      <div className="products-grid">
        {products.map(product => (
          <Link to={`/product/${product.id}`} key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price.toFixed(2)} €</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Shop

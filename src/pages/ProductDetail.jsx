import { useParams } from 'react-router-dom'
import './ProductDetail.css'

const products = [
  { id: 1, name: 'Création 1', price: 49.99, image: 'https://via.placeholder.com/500', description: 'Une magnifique création artisanale faite avec passion et soin.' },
  { id: 2, name: 'Création 2', price: 59.99, image: 'https://via.placeholder.com/500', description: 'Pièce unique réalisée avec des matériaux de qualité.' },
  { id: 3, name: 'Création 3', price: 39.99, image: 'https://via.placeholder.com/500', description: 'Un objet d\'art fonctionnel pour votre quotidien.' },
  { id: 4, name: 'Création 4', price: 69.99, image: 'https://via.placeholder.com/500', description: 'Création haut de gamme pour les connaisseurs.' },
  { id: 5, name: 'Création 5', price: 44.99, image: 'https://via.placeholder.com/500', description: 'Design élégant et fabrication soignée.' },
  { id: 6, name: 'Création 6', price: 54.99, image: 'https://via.placeholder.com/500', description: 'Une pièce qui allie tradition et modernité.' },
]

function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))

  if (!product) {
    return <div className="product-detail"><h2>Produit non trouvé</h2></div>
  }

  return (
    <div className="product-detail">
      <div className="product-detail-grid">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price.toFixed(2)} €</p>
          <p className="description">{product.description}</p>
          <button className="add-to-cart">Ajouter au panier</button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

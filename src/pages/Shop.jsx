import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Shop.css'
import { products } from '../data/products'
import { useInventory } from '../context/InventoryContext'
import SoldBadge from '../components/SoldBadge'

function Shop() {
  const { isSold, loading } = useInventory()

  if (loading) {
    return (
      <div className="shop">
        <div className="loading">Chargement des œuvres...</div>
      </div>
    )
  }

  return (
    <div className="shop">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Collection Complète</h1>
        <p className="shop-subtitle">Œuvres disponibles à l'achat</p>
      </motion.div>

      <div className="products-grid">
        {products.map(product => (
          <motion.div
            key={product.id}
            initial={{
              opacity: 0,
              y: 80,
              scale: 0.85
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.8,
                delay: 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <Link
              to={`/product/${product.id}`}
              className={`product-card ${isSold(product.id) ? 'sold' : ''}`}
              onClick={(e) => isSold(product.id) && e.preventDefault()}
            >
              <motion.div
                className="product-image-container"
                initial={{ opacity: 0, scale: 1.1 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 1,
                    delay: 0.2
                  }
                }}
                viewport={{ once: true }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
                {isSold(product.id) && <SoldBadge />}
              </motion.div>
              <motion.div
                className="product-info"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.4
                  }
                }}
                viewport={{ once: true }}
              >
                <h3>{product.name}</h3>
                <p className="price">{product.price.toFixed(2)} €</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Shop

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Shop.css'

import img1 from '../assets/561676007_17858710800524609_966159427435168161_n.jpg'
import img2 from '../assets/566027323_17860076811524609_3890717275703473961_n.jpg'
import img3 from '../assets/566943302_17860077999524609_139768563597202447_n.jpg'
import img4 from '../assets/572235425_17861416944524609_3463920233784334214_n.jpg'
import img5 from '../assets/572844840_17861111490524609_975655948130670703_n.jpg'
import img6 from '../assets/573313877_17862175311524609_6903431562385700038_n.jpg'
import img7 from '../assets/573523271_17861910591524609_5276602963239441975_n.jpg'
import img8 from '../assets/576458278_17862690423524609_5149917018225823158_n.jpg'
import img9 from '../assets/588832750_17865251334524609_3240054877398157525_n.jpg'
import img10 from '../assets/597807467_17865995514524609_7025555680287479999_n.jpg'

const products = [
  { id: 1, name: 'Œuvre 1', price: 450.00, image: img1, description: 'Broderie colorée sur photographie' },
  { id: 2, name: 'Œuvre 2', price: 450.00, image: img2, description: 'Broderie colorée sur photographie' },
  { id: 3, name: 'Œuvre 3', price: 450.00, image: img3, description: 'Broderie colorée sur photographie' },
  { id: 4, name: 'Œuvre 4', price: 450.00, image: img4, description: 'Broderie colorée sur photographie' },
  { id: 5, name: 'Œuvre 5', price: 450.00, image: img5, description: 'Broderie colorée sur photographie' },
  { id: 6, name: 'Œuvre 6', price: 450.00, image: img6, description: 'Broderie colorée sur photographie' },
  { id: 7, name: 'Œuvre 7', price: 450.00, image: img7, description: 'Broderie colorée sur photographie' },
  { id: 8, name: 'Œuvre 8', price: 450.00, image: img8, description: 'Broderie colorée sur photographie' },
  { id: 9, name: 'Œuvre 9', price: 450.00, image: img9, description: 'Broderie colorée sur photographie' },
  { id: 10, name: 'Œuvre 10', price: 450.00, image: img10, description: 'Broderie colorée sur photographie' },
]

function Shop() {
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
            <Link to={`/product/${product.id}`} className="product-card">
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
                <img src={product.image} alt={product.name} />
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

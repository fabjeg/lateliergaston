import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getOptimizedImageUrl } from '../../utils/imageUrl'

function CardsBlock({ block, delay = 0 }) {
  if (!block?.active) return null

  const isExternal = (url) => url && (url.startsWith('http://') || url.startsWith('https://'))

  const s = block.style || {}
  const sectionStyle = s.bgColor ? { background: s.bgColor, borderRadius: '16px', padding: '3rem 2rem' } : {}
  const titleStyle = {}
  if (s.titleColor) titleStyle.color = s.titleColor
  if (s.titleSize) titleStyle.fontSize = s.titleSize + 'rem'

  const textStyle = {}
  if (s.textSize) textStyle.fontSize = s.textSize + 'rem'

  const titleClass = s.titleBordered ? 'block-title-bordered' : ''

  return (
    <motion.section
      key={block.id}
      className="accueil-cards-block"
      style={sectionStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {block.title && <h2 className={titleClass} style={titleStyle}>{block.title}</h2>}
      {block.text && (
        <div className="cards-block-text">
          {block.text.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
            <p key={idx} style={textStyle}>{paragraph}</p>
          ))}
        </div>
      )}
      <div className="cards-block-grid">
        {(block.cards || []).map((card) => (
          <div key={card.id} className="card-item">
            {card.image && (
              <div className="card-item-image">
                <img src={getOptimizedImageUrl(card.image, 600)} alt={card.title || ''} width="300" height="300" loading="lazy" decoding="async" />
              </div>
            )}
            <div className="card-item-content">
              {card.title && <h3 style={textStyle}>{card.title}</h3>}
              {card.description && <p style={textStyle}>{card.description}</p>}
              {card.link && (
                isExternal(card.link) ? (
                  <a href={card.link} target="_blank" rel="noopener noreferrer" className="card-item-btn">
                    {card.linkText || 'Voir'}
                  </a>
                ) : (
                  <Link to={card.link} className="card-item-btn">
                    {card.linkText || 'Voir'}
                  </Link>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {block.link && (
        <div className="cards-block-btn-wrapper">
          {isExternal(block.link) ? (
            <a href={block.link} target="_blank" rel="noopener noreferrer" className="cards-block-btn">
              {block.linkText || 'Voir tout'}
            </a>
          ) : (
            <Link to={block.link} className="cards-block-btn">
              {block.linkText || 'Voir tout'}
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}

export default CardsBlock

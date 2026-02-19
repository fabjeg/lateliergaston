import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getOptimizedImageUrl } from '../../utils/imageUrl'

function TextBlock({ block, delay = 0 }) {
  if (!block?.active) return null

  const isExternal = (url) => url && (url.startsWith('http://') || url.startsWith('https://'))

  const s = block.style || {}
  const sectionStyle = s.bgColor ? { background: s.bgColor } : {}
  const titleStyle = {}
  if (s.titleColor) titleStyle.color = s.titleColor
  if (s.titleSize) titleStyle.fontSize = s.titleSize + 'rem'

  const textStyle = {}
  if (s.textSize) textStyle.fontSize = s.textSize + 'rem'

  const titleClass = s.titleBordered ? 'block-title-bordered' : ''

  return (
    <motion.section
      key={block.id}
      className="accueil-text-block"
      style={sectionStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {block.title && <h2 className={titleClass} style={titleStyle}>{block.title}</h2>}
      {block.image && (
        <div className="text-block-image">
          <img src={getOptimizedImageUrl(block.image, 800)} alt={block.title || ''} width="600" height="400" loading="lazy" decoding="async" />
        </div>
      )}
      <div className="text-block-content">
        {(block.content || '').split('\n').filter(p => p.trim()).map((paragraph, idx) => (
          <p key={idx} style={textStyle}>{paragraph}</p>
        ))}
      </div>
      {block.link && (
        <div className="text-block-btn-wrapper">
          {isExternal(block.link) ? (
            <a href={block.link} target="_blank" rel="noopener noreferrer" className="text-block-btn">
              {block.linkText || 'Decouvrir'}
            </a>
          ) : (
            <Link to={block.link} className="text-block-btn">
              {block.linkText || 'Decouvrir'}
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}

export default TextBlock

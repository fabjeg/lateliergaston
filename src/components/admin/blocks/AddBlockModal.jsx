import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AddBlockModal.css'

const blockTypes = [
  {
    type: 'cards',
    label: 'Cartes',
    description: 'Grille de cartes visuelles avec image, titre et lien',
    preview: (
      <div className="abm-preview-cards">
        <div className="abm-card-mini" />
        <div className="abm-card-mini" />
        <div className="abm-card-mini" />
      </div>
    )
  },
  {
    type: 'carousel',
    label: 'Carousel',
    description: 'Diaporama 3D avec navigation et lecture automatique',
    preview: (
      <div className="abm-preview-carousel">
        <div className="abm-slide-mini side" />
        <div className="abm-slide-mini center" />
        <div className="abm-slide-mini side" />
      </div>
    )
  },
  {
    type: 'text',
    label: 'Texte',
    description: 'Section avec titre, paragraphes, image et bouton',
    preview: (
      <div className="abm-preview-text">
        <div className="abm-text-line title" />
        <div className="abm-text-line" />
        <div className="abm-text-line" />
        <div className="abm-text-line short" />
      </div>
    )
  }
]

function AddBlockModal({ isOpen, onSelect, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="add-block-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className="add-block-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="abm-header">
              <h3 className="abm-title">Ajouter un bloc</h3>
              <p className="abm-subtitle">Choisissez le type de contenu a ajouter</p>
            </div>

            <div className="abm-options">
              {blockTypes.map((bt, i) => (
                <motion.button
                  key={bt.type}
                  className="abm-option"
                  onClick={() => onSelect(bt.type)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.25 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="abm-option-preview">
                    {bt.preview}
                  </div>
                  <div className="abm-option-info">
                    <span className="abm-option-label">{bt.label}</span>
                    <span className="abm-option-desc">{bt.description}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            <button className="abm-cancel" onClick={onCancel}>
              Annuler
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AddBlockModal

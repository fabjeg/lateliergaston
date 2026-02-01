import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './AnimalHairModal.css'

function AnimalHairModal({ isOpen, onConfirm, onDismiss }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onDismiss])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="animal-hair-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
        >
          <motion.div
            className="animal-hair-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="animal-hair-close" onClick={onDismiss} aria-label="Fermer">
              &times;
            </button>

            <h2 className="animal-hair-title">Poils d'Animaux - Informations d'envoi</h2>

            <p className="animal-hair-intro">
              Pour realiser votre creation avec les poils de votre compagnon, veuillez nous les envoyer par courrier a l'adresse suivante :
            </p>

            <div className="animal-hair-address">
              <strong>L'Atelier Gaston</strong><br />
              Crach 56950<br />
              Bretagne, France
            </div>

            <h3 className="animal-hair-subtitle">Instructions de preparation</h3>
            <ul className="animal-hair-instructions">
              <li>Les poils doivent etre <strong>propres et secs</strong></li>
              <li>Prevoir une <strong>quantite suffisante</strong> (environ une petite poignee)</li>
              <li>Placer les poils dans un <strong>sachet hermetique</strong> (type zip)</li>
              <li>Glisser le sachet dans une <strong>enveloppe rigide</strong> pour eviter l'ecrasement</li>
              <li>Indiquer votre <strong>nom et numero de commande</strong> sur l'enveloppe</li>
            </ul>

            <button className="animal-hair-confirm" onClick={onConfirm}>
              J'ai compris
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimalHairModal

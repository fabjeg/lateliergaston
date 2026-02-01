import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ConfirmModal.css'

function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Oui',
  cancelText = 'Non',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  // Empêcher le scroll du body quand la modal est ouverte
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirm-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
        >
          <motion.div
            className={`confirm-modal ${type}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon">
              {type === 'danger' && '⚠️'}
              {type === 'warning' && '⚡'}
              {type === 'info' && 'ℹ️'}
            </div>
            <h3 className="confirm-modal-title">{title}</h3>
            <p className="confirm-modal-message">{message}</p>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                className={`confirm-modal-btn confirm ${type}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal

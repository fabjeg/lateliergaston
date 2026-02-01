import { useState, useEffect } from 'react'
import { getAllProductsAdmin } from '../../services/productApi'
import { getAnnouncementsContent } from '../../services/announcementsApi'
import './ImagePickerModal.css'

function ImagePickerModal({ isOpen, onSelect, onClose }) {
  const [tab, setTab] = useState('products')
  const [productImages, setProductImages] = useState([])
  const [siteImages, setSiteImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    Promise.all([loadProductImages(), loadSiteImages()]).then(() => setLoading(false))
  }, [isOpen])

  async function loadProductImages() {
    const result = await getAllProductsAdmin()
    if (result.success) {
      const images = result.products
        .filter(p => p.image || p.imageUrl)
        .map(p => ({
          url: p.imageUrl || p.image,
          label: p.name
        }))
      setProductImages(images)
    }
  }

  async function loadSiteImages() {
    const result = await getAnnouncementsContent()
    if (!result.success) return

    const content = result.content || {}
    const images = []
    const seen = new Set()

    const add = (url, label) => {
      if (url && !seen.has(url)) {
        seen.add(url)
        images.push({ url, label })
      }
    }

    // Art section images
    if (content.artSection?.images) {
      content.artSection.images.forEach((url, i) => add(url, `Art ${i + 1}`))
    }

    // Custom blocks images
    if (content.customBlocks) {
      for (const block of content.customBlocks) {
        if (block.type === 'carousel' && block.images) {
          block.images.forEach((url, i) => add(url, `${block.title || 'Carousel'} ${i + 1}`))
        }
        if (block.type === 'cards' && block.cards) {
          block.cards.forEach(card => {
            if (card.image) add(card.image, card.title || 'Card')
          })
        }
        if (block.type === 'text' && block.image) {
          add(block.image, block.title || 'Texte')
        }
      }
    }

    setSiteImages(images)
  }

  function handleSelect(url) {
    onSelect(url)
    onClose()
  }

  if (!isOpen) return null

  const currentImages = tab === 'products' ? productImages : siteImages

  return (
    <div className="image-picker-overlay" onClick={onClose}>
      <div className="image-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="image-picker-header">
          <h3>Choisir une image</h3>
          <button className="image-picker-close" onClick={onClose}>&#x2715;</button>
        </div>

        <div className="image-picker-tabs">
          <button
            className={`image-picker-tab ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            Oeuvres ({productImages.length})
          </button>
          <button
            className={`image-picker-tab ${tab === 'site' ? 'active' : ''}`}
            onClick={() => setTab('site')}
          >
            Images du site ({siteImages.length})
          </button>
        </div>

        <div className="image-picker-body">
          {loading ? (
            <div className="image-picker-loading">Chargement des images...</div>
          ) : currentImages.length === 0 ? (
            <div className="image-picker-empty">Aucune image disponible</div>
          ) : (
            <div className="image-picker-grid">
              {currentImages.map((img, i) => (
                <div
                  key={img.url + i}
                  className="image-picker-item"
                  onClick={() => handleSelect(img.url)}
                >
                  <img src={img.url} alt={img.label || ''} loading="lazy" />
                  {img.label && <span className="image-picker-item-label">{img.label}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImagePickerModal

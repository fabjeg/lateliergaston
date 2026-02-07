import { useState, useEffect } from 'react'
import { getAnnouncementsContent, updateAnnouncementsContent } from '../../services/announcementsApi'
import { getAllProducts, uploadImage } from '../../services/productApi'
import BackButton from '../../components/BackButton'
import Loader from '../../components/Loader'
import BlockEditorCards from '../../components/admin/blocks/BlockEditorCards'
import BlockEditorCarousel from '../../components/admin/blocks/BlockEditorCarousel'
import BlockEditorText from '../../components/admin/blocks/BlockEditorText'
import AddBlockModal from '../../components/admin/blocks/AddBlockModal'
import './AdminAnnouncements.css'

function AdminAnnouncements() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [products, setProducts] = useState([])
  const [content, setContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    announcement: {
      active: true,
      title: '',
      text: '',
      link: '/shop',
      linkText: ''
    },
    featuredTitle: '',
    featuredProductIds: [],
    artSection: {
      active: true,
      title: '',
      text: '',
      images: []
    },
    sectionsOrder: ['hero', 'announcement', 'featured', 'art', 'cta'],
    customBlocks: []
  })

  const builtInLabels = {
    hero: 'En-tête (Titre principal)',
    announcement: 'Bannière d\'annonce',
    featured: 'Produits à la une',
    art: 'Section "Mon Art"',
    cta: 'Appel à l\'action (Sur-mesure)'
  }

  const getSectionLabel = (key) => {
    if (builtInLabels[key]) return builtInLabels[key]
    const block = (content.customBlocks || []).find(b => b.id === key)
    if (block) {
      const typeLabel = { cards: 'Cards', carousel: 'Carousel', text: 'Texte' }[block.type] || block.type
      return `Bloc ${typeLabel} : ${block.title || 'Sans titre'}`
    }
    return key
  }

  const [uploadingArtImage, setUploadingArtImage] = useState(false)
  const [uploadingArtMainImage, setUploadingArtMainImage] = useState(false)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [draggedSection, setDraggedSection] = useState(null)
  const [dragOverSection, setDragOverSection] = useState(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)

    // Charger les annonces
    const result = await getAnnouncementsContent()
    if (result.success && result.content) {
      setContent({
        heroTitle: result.content.heroTitle || '',
        heroSubtitle: result.content.heroSubtitle || '',
        announcement: result.content.announcement || {
          active: true,
          title: '',
          text: '',
          link: '/shop',
          linkText: ''
        },
        featuredTitle: result.content.featuredTitle || '',
        featuredProductIds: result.content.featuredProductIds || [],
        artSection: result.content.artSection || {
          active: true,
          title: '',
          text: '',
          images: []
        },
        sectionsOrder: result.content.sectionsOrder || ['hero', 'announcement', 'featured', 'art', 'cta'],
        customBlocks: result.content.customBlocks || []
      })
    }

    // Charger les produits
    const productsResult = await getAllProducts()
    if (productsResult.success) {
      setProducts(productsResult.products)
    }

    setLoading(false)
  }

  const handleChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  const handleAnnouncementChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      announcement: { ...prev.announcement, [field]: value }
    }))
  }

  const handleProductToggle = (productId) => {
    setContent(prev => {
      const ids = prev.featuredProductIds
      if (ids.includes(productId)) {
        return { ...prev, featuredProductIds: ids.filter(id => id !== productId) }
      } else if (ids.length < 8) {
        return { ...prev, featuredProductIds: [...ids, productId] }
      }
      return prev
    })
  }

  const handleArtSectionChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      artSection: { ...prev.artSection, [field]: value }
    }))
  }

  const handleArtImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: "L'image doit faire moins de 5MB" })
      return
    }

    setUploadingArtImage(true)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = await uploadImage(reader.result, file.name)
      setUploadingArtImage(false)

      if (result.success) {
        setContent(prev => ({
          ...prev,
          artSection: {
            ...prev.artSection,
            images: [...(prev.artSection.images || []), result.url]
          }
        }))
      } else {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload" })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveArtImage = (indexToRemove) => {
    setContent(prev => ({
      ...prev,
      artSection: {
        ...prev.artSection,
        images: prev.artSection.images.filter((_, index) => index !== indexToRemove)
      }
    }))
  }

  const handleMoveArtImage = (index, direction) => {
    setContent(prev => {
      const images = [...prev.artSection.images]
      const newIndex = direction === 'up' ? index - 1 : index + 1

      if (newIndex < 0 || newIndex >= images.length) return prev

      // Swap images
      [images[index], images[newIndex]] = [images[newIndex], images[index]]

      return {
        ...prev,
        artSection: {
          ...prev.artSection,
          images
        }
      }
    })
  }

  const handleArtMainImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image valide' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: "L'image doit faire moins de 5MB" })
      return
    }

    setUploadingArtMainImage(true)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = await uploadImage(reader.result, file.name)
      setUploadingArtMainImage(false)

      if (result.success) {
        handleArtSectionChange('mainImage', result.url)
      } else {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload" })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveArtMainImage = () => {
    handleArtSectionChange('mainImage', '')
  }

  const handleAddBlock = (type) => {
    const id = 'block-' + Date.now()
    let newBlock
    if (type === 'cards') {
      newBlock = { id, type: 'cards', title: '', active: true, cards: [], style: {} }
    } else if (type === 'carousel') {
      newBlock = { id, type: 'carousel', title: '', active: true, images: [], autoplay: true, interval: 5, style: {} }
    } else {
      newBlock = { id, type: 'text', title: '', active: true, content: '', style: {} }
    }
    setContent(prev => ({
      ...prev,
      customBlocks: [...(prev.customBlocks || []), newBlock],
      sectionsOrder: [...(prev.sectionsOrder || []), id]
    }))
    setShowAddBlock(false)
  }

  const handleBlockChange = (id, updatedBlock) => {
    setContent(prev => ({
      ...prev,
      customBlocks: (prev.customBlocks || []).map(b => b.id === id ? updatedBlock : b)
    }))
  }

  const handleBlockDelete = (id) => {
    setContent(prev => ({
      ...prev,
      customBlocks: (prev.customBlocks || []).filter(b => b.id !== id),
      sectionsOrder: (prev.sectionsOrder || []).filter(k => k !== id)
    }))
  }

  const handleDragStart = (e, sectionKey) => {
    setDraggedSection(sectionKey)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, sectionKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (sectionKey !== draggedSection) {
      setDragOverSection(sectionKey)
    }
  }

  const handleDragLeave = () => {
    setDragOverSection(null)
  }

  const handleDrop = (e, targetKey) => {
    e.preventDefault()
    if (!draggedSection || draggedSection === targetKey) {
      setDraggedSection(null)
      setDragOverSection(null)
      return
    }

    setContent(prev => {
      const order = [...(prev.sectionsOrder || ['hero', 'announcement', 'featured', 'art', 'cta'])]
      const draggedIndex = order.indexOf(draggedSection)
      const targetIndex = order.indexOf(targetKey)

      // Remove dragged item and insert at target position
      order.splice(draggedIndex, 1)
      order.splice(targetIndex, 0, draggedSection)

      return {
        ...prev,
        sectionsOrder: order
      }
    })

    setDraggedSection(null)
    setDragOverSection(null)
  }

  const handleDragEnd = () => {
    setDraggedSection(null)
    setDragOverSection(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const result = await updateAnnouncementsContent(content)

    if (result.success) {
      setMessage({ type: 'success', text: 'Contenu mis à jour avec succès !' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de la mise à jour' })
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="admin-announcements">
        <Loader text="Chargement du contenu" />
      </div>
    )
  }

  return (
    <div className="admin-announcements">
      <BackButton to="/admin/dashboard" />

      <h1>Modifier la page Accueil</h1>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Ordre des sections */}
        <div className="form-section">
          <h2>Ordre des sections</h2>
          <p className="help-text">
            Glissez-déposez pour réorganiser l'ordre des sections sur la page d'accueil
          </p>
          <div className="sections-order-list">
            {(content.sectionsOrder || ['hero', 'announcement', 'featured', 'art', 'cta']).map((sectionKey, index) => (
              <div
                key={sectionKey}
                className={`section-order-item ${draggedSection === sectionKey ? 'dragging' : ''} ${dragOverSection === sectionKey ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, sectionKey)}
                onDragOver={(e) => handleDragOver(e, sectionKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, sectionKey)}
                onDragEnd={handleDragEnd}
              >
                <span className="section-order-handle">⠿</span>
                <span className="section-order-number">{index + 1}</span>
                <span className="section-order-label">{getSectionLabel(sectionKey)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Hero */}
        <div className="form-section">
          <h2>En-tête de la page</h2>

          <div className="form-group">
            <label>Titre principal</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder="Bienvenue à L'Atelier Gaston"
            />
          </div>

          <div className="form-group">
            <label>Sous-titre</label>
            <textarea
              value={content.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              rows={2}
              placeholder="Découvrez nos créations uniques..."
            />
          </div>
        </div>

        {/* Section Annonce */}
        <div className="form-section">
          <h2>Bannière d'annonce</h2>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.announcement.active}
                onChange={(e) => handleAnnouncementChange('active', e.target.checked)}
              />
              <span>Afficher la bannière d'annonce</span>
            </label>
          </div>

          {content.announcement.active && (
            <>
              <div className="form-group">
                <label>Titre de l'annonce</label>
                <input
                  type="text"
                  value={content.announcement.title}
                  onChange={(e) => handleAnnouncementChange('title', e.target.value)}
                  placeholder="Nouvelle Collection"
                />
              </div>

              <div className="form-group">
                <label>Texte de l'annonce</label>
                <textarea
                  value={content.announcement.text}
                  onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                  rows={3}
                  placeholder="Découvrez notre nouvelle collection..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lien (URL)</label>
                  <select
                    value={content.announcement.link}
                    onChange={(e) => handleAnnouncementChange('link', e.target.value)}
                  >
                    <option value="/shop">Boutique</option>
                    <option value="/gallery">Galerie</option>
                    <option value="/sur-mesure">Sur-mesure</option>
                    <option value="/about">À propos</option>
                    <option value="/contact">Contact</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Texte du bouton</label>
                  <input
                    type="text"
                    value={content.announcement.linkText}
                    onChange={(e) => handleAnnouncementChange('linkText', e.target.value)}
                    placeholder="Voir la collection"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section Produits à la une */}
        <div className="form-section">
          <h2>Produits à la une</h2>

          <div className="form-group">
            <label>Titre de la section</label>
            <input
              type="text"
              value={content.featuredTitle}
              onChange={(e) => handleChange('featuredTitle', e.target.value)}
              placeholder="Nos créations à la une"
            />
          </div>

          <div className="form-group">
            <label>Sélectionner les produits (max 8)</label>
            <p className="help-text">
              {content.featuredProductIds.length} produit(s) sélectionné(s).
              Si aucun produit n'est sélectionné, les 4 premiers seront affichés.
            </p>
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`product-select-item ${content.featuredProductIds.includes(product.id) ? 'selected' : ''}`}
                  onClick={() => handleProductToggle(product.id)}
                >
                  <img src={product.image} alt={product.name} />
                  <span className="product-name">{product.name}</span>
                  {content.featuredProductIds.includes(product.id) && (
                    <span className="selected-badge">
                      {content.featuredProductIds.indexOf(product.id) + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section À propos de mon art */}
        <div className="form-section">
          <h2>Section "Mon Art"</h2>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={content.artSection?.active ?? true}
                onChange={(e) => handleArtSectionChange('active', e.target.checked)}
              />
              <span>Afficher la section "Mon Art"</span>
            </label>
          </div>

          {content.artSection?.active && (
            <>
              <div className="form-group">
                <label>Titre de la section</label>
                <input
                  type="text"
                  value={content.artSection?.title || ''}
                  onChange={(e) => handleArtSectionChange('title', e.target.value)}
                  placeholder="Mon Art"
                />
              </div>

              <div className="form-group">
                <label>Description de votre art</label>
                <textarea
                  value={content.artSection?.text || ''}
                  onChange={(e) => handleArtSectionChange('text', e.target.value)}
                  rows={5}
                  placeholder="Je tisse des cheveux vrais ou synthétiques ainsi que des poils d'animaux sur des toiles ou photos..."
                />
              </div>

              <div className="form-group">
                <label>Photo à côté du texte</label>
                <p className="help-text">
                  Cette photo s'affichera à droite du texte de description
                </p>

                {content.artSection?.mainImage ? (
                  <div className="art-main-image-preview">
                    <img src={content.artSection.mainImage} alt="Photo principale" />
                    <button
                      type="button"
                      className="art-image-remove"
                      onClick={handleRemoveArtMainImage}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="art-image-add" style={{ width: '200px', height: '200px' }}>
                    <input
                      type="file"
                      accept="image/webp,image/jpeg,image/jpg,image/png"
                      onChange={handleArtMainImageUpload}
                      disabled={uploadingArtMainImage}
                    />
                    {uploadingArtMainImage ? (
                      <span className="uploading-text">Upload...</span>
                    ) : (
                      <>
                        <span className="add-icon">+</span>
                        <span>Ajouter</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div className="form-group">
                <label>Photos de présentation</label>
                <p className="help-text">
                  Ajoutez des photos pour illustrer votre travail (max 6 photos)
                </p>

                <div className="art-images-grid">
                  {(content.artSection?.images || []).map((image, index) => (
                    <div key={index} className="art-image-item">
                      <img src={image} alt={`Art ${index + 1}`} />
                      <div className="art-image-actions">
                        <button
                          type="button"
                          className="art-image-move"
                          onClick={() => handleMoveArtImage(index, 'up')}
                          disabled={index === 0}
                          title="Déplacer vers la gauche"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="art-image-remove"
                          onClick={() => handleRemoveArtImage(index)}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className="art-image-move"
                          onClick={() => handleMoveArtImage(index, 'down')}
                          disabled={index === (content.artSection?.images || []).length - 1}
                          title="Déplacer vers la droite"
                        >
                          ›
                        </button>
                      </div>
                      <span className="art-image-number">{index + 1}</span>
                    </div>
                  ))}

                  {(content.artSection?.images || []).length < 6 && (
                    <label className="art-image-add">
                      <input
                        type="file"
                        accept="image/webp,image/jpeg,image/jpg,image/png"
                        onChange={handleArtImageUpload}
                        disabled={uploadingArtImage}
                      />
                      {uploadingArtImage ? (
                        <span className="uploading-text">Upload...</span>
                      ) : (
                        <>
                          <span className="add-icon">+</span>
                          <span>Ajouter</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Blocks Editors */}
        {(content.customBlocks || []).map((block) => {
          switch (block.type) {
            case 'cards':
              return <BlockEditorCards key={block.id} block={block} onChange={handleBlockChange} onDelete={handleBlockDelete} />
            case 'carousel':
              return <BlockEditorCarousel key={block.id} block={block} onChange={handleBlockChange} onDelete={handleBlockDelete} />
            case 'text':
              return <BlockEditorText key={block.id} block={block} onChange={handleBlockChange} onDelete={handleBlockDelete} />
            default:
              return null
          }
        })}

        <div className="add-block-section">
          <button type="button" className="btn-add-block" onClick={() => setShowAddBlock(true)}>
            + Ajouter un bloc
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>

      <AddBlockModal
        isOpen={showAddBlock}
        onSelect={handleAddBlock}
        onCancel={() => setShowAddBlock(false)}
      />
    </div>
  )
}

export default AdminAnnouncements

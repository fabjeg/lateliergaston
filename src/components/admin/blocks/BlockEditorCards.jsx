import { useState, useEffect } from 'react'
import { uploadImage } from '../../../services/productApi'
import { getAllCollections } from '../../../services/collectionApi'
import ConfirmModal from '../ConfirmModal'
import ImagePickerModal from '../ImagePickerModal'
import BlockStyleEditor from './BlockStyleEditor'

function BlockEditorCards({ block, onChange, onDelete }) {
  const [uploadingCardId, setUploadingCardId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [collections, setCollections] = useState([])
  const [pickerCardId, setPickerCardId] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedCards, setCollapsedCards] = useState({})

  useEffect(() => {
    const result = getAllCollections()
    if (result.success) setCollections(result.collections)
  }, [])

  const updateBlock = (updates) => {
    onChange(block.id, { ...block, ...updates })
  }

  const updateCard = (cardId, updates) => {
    const cards = (block.cards || []).map(c =>
      c.id === cardId ? { ...c, ...updates } : c
    )
    updateBlock({ cards })
  }

  const addCard = () => {
    const newCard = {
      id: 'card-' + Date.now(),
      image: '',
      title: '',
      description: '',
      link: '',
      linkText: ''
    }
    updateBlock({ cards: [...(block.cards || []), newCard] })
  }

  const removeCard = (cardId) => {
    updateBlock({ cards: (block.cards || []).filter(c => c.id !== cardId) })
  }

  const moveCard = (index, direction) => {
    const cards = [...(block.cards || [])]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= cards.length) return
    ;[cards[index], cards[newIndex]] = [cards[newIndex], cards[index]]
    updateBlock({ cards })
  }

  const toggleCardCollapse = (cardId) => {
    setCollapsedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const handleCardImageUpload = async (e, cardId) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return

    setUploadingCardId(cardId)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = await uploadImage(reader.result, file.name)
      setUploadingCardId(null)
      if (result.success) {
        updateCard(cardId, { image: result.url })
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const cards = block.cards || []

  return (
    <div className={`form-section block-editor ${!block.active ? 'block-inactive' : ''}`}>
      <div className="block-editor-header" onClick={() => setCollapsed(c => !c)}>
        <div className="block-editor-header-left">
          <span className={`block-editor-chevron ${collapsed ? 'collapsed' : ''}`}>&#9660;</span>
          <span className="block-editor-type-badge badge-cards">Cartes</span>
          <h2>{block.title || 'Sans titre'}</h2>
          <span className="block-editor-count">{cards.length} carte{cards.length !== 1 ? 's' : ''}</span>
          {!block.active && <span className="block-editor-hidden-badge">Masque</span>}
        </div>
        <div className="block-editor-header-right" onClick={(e) => e.stopPropagation()}>
          <label className="block-editor-toggle">
            <input
              type="checkbox"
              checked={block.active}
              onChange={(e) => updateBlock({ active: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
          <button type="button" className="btn-delete-block" onClick={() => setConfirmDelete(true)}>
            Supprimer
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="block-editor-body">
          <div className="form-group">
            <label>Titre du bloc</label>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => updateBlock({ title: e.target.value })}
              placeholder="Titre du bloc cartes"
            />
          </div>

          <div className="form-group">
            <label>Texte introductif (optionnel)</label>
            <textarea
              value={block.text || ''}
              onChange={(e) => updateBlock({ text: e.target.value })}
              rows={2}
              placeholder="Texte introductif (saut de ligne = nouveau paragraphe)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bouton du bloc</label>
              <select
                value={block.link || ''}
                onChange={(e) => updateBlock({ link: e.target.value })}
              >
                <option value="">Aucun bouton</option>
                <optgroup label="Pages">
                  <option value="/shop">Boutique</option>
                  <option value="/gallery">Galerie (toutes)</option>
                  <option value="/sur-mesure">Sur-mesure</option>
                  <option value="/about">A propos</option>
                  <option value="/contact">Contact</option>
                </optgroup>
                {collections.length > 0 && (
                  <optgroup label="Galerie par collection">
                    {collections.map(c => (
                      <option key={c.id} value={`/gallery?collection=${c.id}`}>
                        Galerie : {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Texte du bouton</label>
              <input
                type="text"
                value={block.linkText || ''}
                onChange={(e) => updateBlock({ linkText: e.target.value })}
                placeholder="Voir tout"
                disabled={!block.link}
              />
            </div>
          </div>

          <div className="block-cards-list">
            <div className="block-cards-list-header">
              <label>Cartes ({cards.length})</label>
            </div>

            {cards.map((card, idx) => (
              <div key={card.id} className={`block-card-editor ${collapsedCards[card.id] ? 'card-collapsed' : ''}`}>
                <div className="block-card-editor-header" onClick={() => toggleCardCollapse(card.id)}>
                  <div className="block-card-editor-header-left">
                    <span className={`block-editor-chevron small ${collapsedCards[card.id] ? 'collapsed' : ''}`}>&#9660;</span>
                    {card.image && <img src={card.image} alt="" className="card-header-thumb" />}
                    <span className="card-header-title">{card.title || `Carte ${idx + 1}`}</span>
                  </div>
                  <div className="block-card-editor-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn-move-card" onClick={() => moveCard(idx, 'up')} disabled={idx === 0} title="Monter">
                      &#9650;
                    </button>
                    <button type="button" className="btn-move-card" onClick={() => moveCard(idx, 'down')} disabled={idx === cards.length - 1} title="Descendre">
                      &#9660;
                    </button>
                    <button type="button" className="btn-remove-card" onClick={() => removeCard(card.id)}>
                      &#10005;
                    </button>
                  </div>
                </div>

                {!collapsedCards[card.id] && (
                  <div className="block-card-editor-body">
                    <div className="block-card-image-row">
                      {card.image ? (
                        <div className="block-image-preview small">
                          <img src={card.image} alt="" />
                          <div className="block-image-preview-actions">
                            <button type="button" className="btn-change-image" onClick={() => updateCard(card.id, { image: '' })}>
                              Retirer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="image-source-buttons">
                          <label className="block-card-upload">
                            <input
                              type="file"
                              accept="image/webp,image/jpeg,image/jpg,image/png"
                              onChange={(e) => handleCardImageUpload(e, card.id)}
                              disabled={uploadingCardId === card.id}
                            />
                            {uploadingCardId === card.id ? 'Upload...' : '+ Image'}
                          </label>
                          <button type="button" className="btn-pick-image" onClick={() => setPickerCardId(card.id)}>
                            Bibliotheque
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => updateCard(card.id, { title: e.target.value })}
                        placeholder="Titre de la carte"
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        value={card.description || ''}
                        onChange={(e) => updateCard(card.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Description"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <select
                          value={card.link || ''}
                          onChange={(e) => updateCard(card.id, { link: e.target.value })}
                        >
                          <option value="">Aucun lien</option>
                          <optgroup label="Pages">
                            <option value="/shop">Boutique</option>
                            <option value="/gallery">Galerie (toutes)</option>
                            <option value="/sur-mesure">Sur-mesure</option>
                            <option value="/about">A propos</option>
                            <option value="/contact">Contact</option>
                          </optgroup>
                          {collections.length > 0 && (
                            <optgroup label="Galerie par collection">
                              {collections.map(c => (
                                <option key={c.id} value={`/gallery?collection=${c.id}`}>
                                  Galerie : {c.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          value={card.linkText || ''}
                          onChange={(e) => updateCard(card.id, { linkText: e.target.value })}
                          placeholder="Texte du bouton"
                          disabled={!card.link}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button type="button" className="btn-add-card" onClick={addCard}>
              + Ajouter une carte
            </button>
          </div>

          <details className="block-style-details">
            <summary>Personnaliser l'apparence</summary>
            <BlockStyleEditor
              style={block.style || {}}
              onChange={(style) => updateBlock({ style })}
              showText={true}
            />
          </details>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onConfirm={() => { setConfirmDelete(false); onDelete(block.id) }}
        onCancel={() => setConfirmDelete(false)}
        title="Supprimer ce bloc"
        message={`Voulez-vous vraiment supprimer le bloc "${block.title || 'Cards'}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <ImagePickerModal
        isOpen={pickerCardId !== null}
        onSelect={(url) => updateCard(pickerCardId, { image: url })}
        onClose={() => setPickerCardId(null)}
      />
    </div>
  )
}

export default BlockEditorCards

function BlockStyleEditor({ style = {}, onChange, showText = true }) {
  const update = (key, value) => {
    onChange({ ...style, [key]: value })
  }

  return (
    <div className="block-style-editor">
      <h3 className="block-style-editor-title">Apparence</h3>

      <div className="block-style-grid">
        <div className="form-group">
          <label>Couleur de fond</label>
          <div className="color-input-row">
            <input
              type="color"
              value={style.bgColor || '#ffffff'}
              onChange={(e) => update('bgColor', e.target.value)}
            />
            <input
              type="text"
              value={style.bgColor || ''}
              onChange={(e) => update('bgColor', e.target.value)}
              placeholder="transparent"
            />
            {style.bgColor && (
              <button type="button" className="btn-color-reset" onClick={() => update('bgColor', '')}>
                Retirer
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Couleur du titre</label>
          <div className="color-input-row">
            <input
              type="color"
              value={style.titleColor || '#AD1A31'}
              onChange={(e) => update('titleColor', e.target.value)}
            />
            <input
              type="text"
              value={style.titleColor || ''}
              onChange={(e) => update('titleColor', e.target.value)}
              placeholder="par defaut"
            />
            {style.titleColor && (
              <button type="button" className="btn-color-reset" onClick={() => update('titleColor', '')}>
                Retirer
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Taille du titre (rem)</label>
          <input
            type="number"
            min={0.8}
            max={5}
            step={0.1}
            value={style.titleSize || ''}
            onChange={(e) => update('titleSize', parseFloat(e.target.value) || '')}
            placeholder="2"
          />
        </div>

        {showText && (
          <>
            <div className="form-group">
              <label>Taille du texte (rem)</label>
              <input
                type="number"
                min={0.6}
                max={4}
                step={0.1}
                value={style.textSize || ''}
                onChange={(e) => update('textSize', parseFloat(e.target.value) || '')}
                placeholder="1"
              />
            </div>
          </>
        )}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={style.titleBordered || false}
              onChange={(e) => update('titleBordered', e.target.checked)}
            />
            <span>Titre encadre (bordure decorative)</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default BlockStyleEditor

const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Valide le format et la taille d'un fichier image.
 * @param {File} file
 * @param {number} maxSizeMB - Taille max en Mo (défaut : 5)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, maxSizeMB = 5) {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  if (!VALID_TYPES.includes(type)) {
    if (type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif')) {
      return { valid: false, error: 'Photos iPhone (HEIC) non acceptées. Dans vos Réglages → Appareil photo → Formats, choisissez « Le plus compatible » pour obtenir un JPG.' }
    }
    if (type === 'image/gif' || name.endsWith('.gif')) {
      return { valid: false, error: 'Le format GIF n\'est pas accepté. Utilisez JPG, PNG ou WebP.' }
    }
    if (type === 'image/avif' || name.endsWith('.avif')) {
      return { valid: false, error: 'Le format AVIF n\'est pas accepté. Utilisez JPG, PNG ou WebP.' }
    }
    if (type === 'image/tiff' || name.endsWith('.tiff') || name.endsWith('.tif')) {
      return { valid: false, error: 'Le format TIFF n\'est pas accepté. Utilisez JPG, PNG ou WebP.' }
    }
    if (type === 'image/bmp' || name.endsWith('.bmp')) {
      return { valid: false, error: 'Le format BMP n\'est pas accepté. Utilisez JPG, PNG ou WebP.' }
    }
    if (type === 'image/svg+xml' || name.endsWith('.svg')) {
      return { valid: false, error: 'Le format SVG n\'est pas accepté. Utilisez JPG, PNG ou WebP.' }
    }
    const ext = name.includes('.') ? name.split('.').pop().toUpperCase() : 'inconnu'
    return { valid: false, error: `Format .${ext} non supporté. Utilisez JPG, PNG ou WebP.` }
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `L'image dépasse la taille maximale de ${maxSizeMB} Mo.` }
  }

  return { valid: true }
}

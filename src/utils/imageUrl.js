/**
 * Add Cloudinary transformations to an image URL for optimized delivery.
 * Only transforms Cloudinary URLs; returns other URLs unchanged.
 * @param {string} url - Original image URL
 * @param {number} width - Desired display width in pixels
 * @returns {string} Optimized URL
 */
export function getOptimizedImageUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
}

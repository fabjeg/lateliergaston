// Shipping rates and Stripe Price IDs
// You'll need to create these prices in Stripe Dashboard and add the IDs here

export const SHIPPING_RATES = {
  FR: {
    name: 'France',
    price: 15.00,
    stripePriceId: '' // À ajouter après création dans Stripe Dashboard
  },
  EU: {
    name: 'Europe',
    price: 25.00,
    stripePriceId: '' // À ajouter après création dans Stripe Dashboard
  },
  WORLD: {
    name: 'Reste du monde',
    price: 40.00,
    stripePriceId: '' // À ajouter après création dans Stripe Dashboard
  }
}

// European Union countries (ISO 3166-1 alpha-2 codes)
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
]

/**
 * Get shipping rate based on country code or zone
 * @param {string} countryOrZone - Country code (e.g. 'FR', 'DE') or zone ('FR', 'EU', 'WORLD')
 * @returns {object} Shipping rate object with name, price, and stripePriceId
 */
export function getShippingRate(countryOrZone) {
  // If it's already a zone key, return it directly
  if (SHIPPING_RATES[countryOrZone]) {
    return SHIPPING_RATES[countryOrZone]
  }

  // Otherwise, determine zone from country code
  const upperCountry = countryOrZone.toUpperCase()

  if (upperCountry === 'FR') {
    return SHIPPING_RATES.FR
  }

  if (EU_COUNTRIES.includes(upperCountry)) {
    return SHIPPING_RATES.EU
  }

  return SHIPPING_RATES.WORLD
}

/**
 * Get shipping price (number only)
 * @param {string} countryOrZone - Country code or zone
 * @returns {number} Shipping price
 */
export function getShippingPrice(countryOrZone) {
  return getShippingRate(countryOrZone).price
}

/**
 * Get Stripe Price ID for shipping
 * @param {string} countryOrZone - Country code or zone
 * @returns {string} Stripe Price ID
 */
export function getShippingPriceId(countryOrZone) {
  return getShippingRate(countryOrZone).stripePriceId
}

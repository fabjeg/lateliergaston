/**
 * Script pour mettre à jour automatiquement les Price IDs Stripe
 *
 * COMMENT UTILISER:
 * 1. Remplissez les Price IDs ci-dessous avec ceux de votre Dashboard Stripe
 * 2. Exécutez: node update-stripe-ids.js
 * 3. Les fichiers products.js et shipping.js seront mis à jour automatiquement
 */

// ============================================
// COLLEZ VOS PRICE IDS ICI
// ============================================

const PRODUCT_PRICE_IDS = {
  1: 'price_XXXXXXXXXXXXXXX',  // Œuvre 1
  2: 'price_XXXXXXXXXXXXXXX',  // Œuvre 2
  3: 'price_XXXXXXXXXXXXXXX',  // Œuvre 3
  4: 'price_XXXXXXXXXXXXXXX',  // Œuvre 4
  5: 'price_XXXXXXXXXXXXXXX',  // Œuvre 5
  6: 'price_XXXXXXXXXXXXXXX',  // Œuvre 6
  7: 'price_XXXXXXXXXXXXXXX',  // Œuvre 7
  8: 'price_XXXXXXXXXXXXXXX',  // Œuvre 8
  9: 'price_XXXXXXXXXXXXXXX',  // Œuvre 9
  10: 'price_XXXXXXXXXXXXXXX', // Œuvre 10
}

const SHIPPING_PRICE_IDS = {
  FR: 'price_XXXXXXXXXXXXXXX',     // France
  EU: 'price_XXXXXXXXXXXXXXX',     // Europe
  WORLD: 'price_XXXXXXXXXXXXXXX',  // Reste du monde
}

// ============================================
// NE MODIFIEZ PAS EN DESSOUS DE CETTE LIGNE
// ============================================

const fs = require('fs')
const path = require('path')

function updateProductsFile() {
  const filePath = path.join(__dirname, 'src', 'data', 'products.js')
  let content = fs.readFileSync(filePath, 'utf8')

  // Remplacer chaque stripePriceId
  for (let i = 1; i <= 10; i++) {
    const oldPattern = new RegExp(`(id: ${i},[\\s\\S]*?stripePriceId: )'[^']*'`, 'm')
    content = content.replace(oldPattern, `$1'${PRODUCT_PRICE_IDS[i]}'`)
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log('✅ Fichier products.js mis à jour!')
}

function updateShippingFile() {
  const filePath = path.join(__dirname, 'src', 'utils', 'shipping.js')
  let content = fs.readFileSync(filePath, 'utf8')

  // Remplacer FR
  content = content.replace(
    /(FR: \{[\s\S]*?stripePriceId: )'[^']*'/,
    `$1'${SHIPPING_PRICE_IDS.FR}'`
  )

  // Remplacer EU
  content = content.replace(
    /(EU: \{[\s\S]*?stripePriceId: )'[^']*'/,
    `$1'${SHIPPING_PRICE_IDS.EU}'`
  )

  // Remplacer WORLD
  content = content.replace(
    /(WORLD: \{[\s\S]*?stripePriceId: )'[^']*'/,
    `$1'${SHIPPING_PRICE_IDS.WORLD}'`
  )

  fs.writeFileSync(filePath, content, 'utf8')
  console.log('✅ Fichier shipping.js mis à jour!')
}

function validatePriceIds() {
  const errors = []

  // Vérifier les produits
  for (let i = 1; i <= 10; i++) {
    if (!PRODUCT_PRICE_IDS[i] || PRODUCT_PRICE_IDS[i] === 'price_XXXXXXXXXXXXXXX') {
      errors.push(`❌ Price ID manquant pour Œuvre ${i}`)
    } else if (!PRODUCT_PRICE_IDS[i].startsWith('price_')) {
      errors.push(`❌ Price ID invalide pour Œuvre ${i} (doit commencer par "price_")`)
    }
  }

  // Vérifier la livraison
  ['FR', 'EU', 'WORLD'].forEach(zone => {
    if (!SHIPPING_PRICE_IDS[zone] || SHIPPING_PRICE_IDS[zone] === 'price_XXXXXXXXXXXXXXX') {
      errors.push(`❌ Price ID manquant pour livraison ${zone}`)
    } else if (!SHIPPING_PRICE_IDS[zone].startsWith('price_')) {
      errors.push(`❌ Price ID invalide pour livraison ${zone}`)
    }
  })

  return errors
}

// Exécution
console.log('🚀 Mise à jour des Price IDs Stripe...\n')

const errors = validatePriceIds()

if (errors.length > 0) {
  console.log('⚠️  Erreurs détectées:\n')
  errors.forEach(err => console.log(err))
  console.log('\n💡 Veuillez remplir tous les Price IDs dans update-stripe-ids.js avant de lancer le script.')
  process.exit(1)
}

try {
  updateProductsFile()
  updateShippingFile()
  console.log('\n✨ Tous les fichiers ont été mis à jour avec succès!')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Vérifiez src/data/products.js')
  console.log('2. Vérifiez src/utils/shipping.js')
  console.log('3. Lancez: npm run dev')
  console.log('4. Testez un paiement!')
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour:', error.message)
  process.exit(1)
}

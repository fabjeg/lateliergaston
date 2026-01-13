import sharp from 'sharp'
import { readdir, mkdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ASSETS_DIR = join(__dirname, 'src', 'assets')
const OUTPUT_DIR = join(__dirname, 'src', 'assets', 'optimized')

// Configuration pour l'optimisation
const SHOP_GRID_WIDTH = 800  // Largeur pour la grille boutique
const JPEG_QUALITY = 80      // Qualité JPEG (80-85% recommandé)

async function optimizeImage(inputPath, outputPath, maxWidth) {
  try {
    const image = sharp(inputPath)
    const metadata = await image.metadata()
    const originalStats = await stat(inputPath)
    const originalSize = originalStats.size / 1024 / 1024

    console.log(`📷 ${basename(inputPath)}: ${metadata.width}x${metadata.height} (${originalSize.toFixed(2)} MB)`)

    await image
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(outputPath)

    const optimizedMetadata = await sharp(outputPath).metadata()
    const optimizedStats = await stat(outputPath)
    const optimizedSize = optimizedStats.size / 1024 / 1024
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

    console.log(`✅ Optimisée: ${optimizedMetadata.width}x${optimizedMetadata.height} (${optimizedSize.toFixed(2)} MB) - Gain: ${savings}%\n`)

    return {
      original: basename(inputPath),
      originalSize,
      optimizedSize,
      savings
    }
  } catch (error) {
    console.error(`❌ Erreur sur ${basename(inputPath)}:`, error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Optimisation des images en cours...\n')

  // Créer le dossier de sortie
  try {
    await mkdir(OUTPUT_DIR, { recursive: true })
  } catch (error) {
    // Le dossier existe déjà
  }

  // Lire tous les fichiers du dossier assets
  const files = await readdir(ASSETS_DIR)
  const imageFiles = files.filter(file => {
    const ext = extname(file).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
  })

  if (imageFiles.length === 0) {
    console.log('⚠️  Aucune image trouvée dans src/assets/')
    return
  }

  console.log(`📦 ${imageFiles.length} images à optimiser\n`)

  const results = []

  for (const file of imageFiles) {
    const inputPath = join(ASSETS_DIR, file)
    const outputFileName = basename(file, extname(file)) + '.jpg'
    const outputPath = join(OUTPUT_DIR, outputFileName)

    const result = await optimizeImage(inputPath, outputPath, SHOP_GRID_WIDTH)
    if (result) {
      results.push(result)
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(60))
  console.log('📊 RÉSUMÉ DE L\'OPTIMISATION')
  console.log('='.repeat(60))

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
  const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0)
  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1)

  console.log(`\n📷 Images traitées: ${results.length}`)
  console.log(`📦 Taille originale totale: ${totalOriginal.toFixed(2)} MB`)
  console.log(`✨ Taille optimisée totale: ${totalOptimized.toFixed(2)} MB`)
  console.log(`💾 Gain total: ${totalSavings}%`)
  console.log(`\n✅ Images optimisées sauvegardées dans: src/assets/optimized/`)

  console.log('\n' + '='.repeat(60))
  console.log('📝 PROCHAINES ÉTAPES')
  console.log('='.repeat(60))
  console.log('\n1. Vérifiez les images dans src/assets/optimized/')
  console.log('2. Si elles sont bonnes, remplacez les originales:')
  console.log('   • Sauvegardez les originales (optionnel)')
  console.log('   • Copiez les images de optimized/ vers src/assets/')
  console.log('3. Testez le site: npm run dev')
  console.log('4. Déployez sur Vercel')
  console.log('\n🚀 Votre boutique chargera beaucoup plus vite!\n')
}

main().catch(console.error)

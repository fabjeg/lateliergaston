import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Products data to migrate
const productsData = [
  {
    id: 1,
    name: 'Œuvre 1',
    price: 450.00,
    imageFilename: '561676007_17858710800524609_966159427435168161_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: 'price_1SpCH8Fx9HGSvAHCsRuVYTIa'
  },
  {
    id: 2,
    name: 'Œuvre 2',
    price: 450.00,
    imageFilename: '566027323_17860076811524609_3890717275703473961_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: 'price_1SpDziFx9HGSvAHCEeloW918'
  },
  {
    id: 3,
    name: 'Œuvre 3',
    price: 450.00,
    imageFilename: '566943302_17860077999524609_139768563597202447_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 4,
    name: 'Œuvre 4',
    price: 450.00,
    imageFilename: '572235425_17861416944524609_3463920233784334214_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 5,
    name: 'Œuvre 5',
    price: 450.00,
    imageFilename: '572844840_17861111490524609_975655948130670703_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 6,
    name: 'Œuvre 6',
    price: 450.00,
    imageFilename: '573313877_17862175311524609_6903431562385700038_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 7,
    name: 'Œuvre 7',
    price: 450.00,
    imageFilename: '573523271_17861910591524609_5276602963239441975_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 8,
    name: 'Œuvre 8',
    price: 450.00,
    imageFilename: '576458278_17862690423524609_5149917018225823158_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 9,
    name: 'Œuvre 9',
    price: 450.00,
    imageFilename: '588832750_17865251334524609_3240054877398157525_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  },
  {
    id: 10,
    name: 'Œuvre 10',
    price: 450.00,
    imageFilename: '597807467_17865995514524609_7025555680287479999_n.webp',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: ''
  }
]

/**
 * Convert image file to base64 data URL
 */
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase().replace('.', '')
    return `data:image/${ext};base64,${base64}`
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de l'image ${imagePath}:`, error.message)
    return null
  }
}

async function migrateProducts() {
  console.log('\n=== Migration des produits vers MongoDB ===\n')

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERREUR: MONGODB_URI n\'est pas défini dans .env.local')
    console.log('\nVeuillez créer un fichier .env.local avec:')
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lateliergaston')
    process.exit(1)
  }

  let client

  try {
    console.log('🔄 Connexion à MongoDB...')

    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    console.log('✅ Connecté à MongoDB\n')

    const db = client.db('lateliergaston')
    const productsCollection = db.collection('products')

    // Check if products already exist
    const existingCount = await productsCollection.countDocuments()
    if (existingCount > 0) {
      console.log(`⚠️  Il y a déjà ${existingCount} produit(s) dans la base de données`)
      console.log('❌ Migration annulée pour éviter les doublons')
      console.log('\nSi vous voulez recommencer, supprimez d\'abord la collection products')
      process.exit(1)
    }

    const assetsPath = path.join(__dirname, '..', 'src', 'assets')
    console.log(`📁 Dossier des images: ${assetsPath}\n`)

    let successCount = 0
    let errorCount = 0

    // Process each product
    for (const productData of productsData) {
      console.log(`🔄 Migration de "${productData.name}"...`)

      // Load and convert image to base64
      const imagePath = path.join(assetsPath, productData.imageFilename)
      const imageBase64 = imageToBase64(imagePath)

      if (!imageBase64) {
        console.log(`   ❌ Échec: impossible de charger l'image`)
        errorCount++
        continue
      }

      // Calculate image size
      const sizeKB = Math.round((imageBase64.length * 0.75) / 1024)
      console.log(`   📷 Image chargée (${sizeKB}KB)`)

      // Create product document
      const product = {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        imageBase64,
        imageFilename: productData.imageFilename,
        stripePriceId: productData.stripePriceId || '',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Insert into MongoDB
      await productsCollection.insertOne(product)
      console.log(`   ✅ Migré avec succès\n`)
      successCount++
    }

    // Create indexes
    console.log('🔄 Création des index...')
    await productsCollection.createIndex({ id: 1 }, { unique: true })
    await productsCollection.createIndex({ status: 1 })
    console.log('✅ Index créés\n')

    console.log('=== Résumé de la migration ===')
    console.log(`✅ Réussis: ${successCount}`)
    console.log(`❌ Échecs: ${errorCount}`)
    console.log(`📦 Total: ${productsData.length}`)

    if (successCount === productsData.length) {
      console.log('\n🎉 Migration terminée avec succès!')
    } else {
      console.log('\n⚠️  Migration terminée avec des erreurs')
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

// Run the script
migrateProducts()

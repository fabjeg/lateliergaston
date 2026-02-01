/**
 * Script de migration des images Base64 vers Cloudinary
 *
 * Ce script :
 * 1. Récupère tous les produits avec des images en base64
 * 2. Upload chaque image vers Cloudinary
 * 3. Met à jour le produit avec l'URL Cloudinary
 * 4. Supprime le base64 de MongoDB pour alléger la base
 *
 * Usage: node scripts/migrate-images-to-cloudinary.js
 */

import { MongoClient } from 'mongodb'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non défini dans .env.local')
  process.exit(1)
}

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Variables Cloudinary non définies dans .env.local')
  process.exit(1)
}

async function uploadToCloudinary(base64Image, productId, productName) {
  // Ensure the base64 string has the data URI prefix
  let imageData = base64Image
  if (!base64Image.startsWith('data:')) {
    imageData = `data:image/webp;base64,${base64Image}`
  }

  const publicId = `product_${productId}_${productName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`

  try {
    const result = await cloudinary.uploader.upload(imageData, {
      folder: 'lateliergaston/products',
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function migrateImages() {
  console.log('🚀 Début de la migration des images vers Cloudinary\n')

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('✅ Connecté à MongoDB\n')

    const db = client.db()
    const productsCollection = db.collection('products')

    // Find all products with base64 images but no Cloudinary URL
    const products = await productsCollection.find({
      imageBase64: { $exists: true, $ne: null },
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: null }
      ]
    }).toArray()

    console.log(`📦 ${products.length} produit(s) à migrer\n`)

    if (products.length === 0) {
      console.log('✨ Tous les produits sont déjà migrés vers Cloudinary!')
      return
    }

    let successCount = 0
    let errorCount = 0
    let totalBytesSaved = 0

    for (const product of products) {
      process.stdout.write(`⏳ Migration de "${product.name}" (ID: ${product.id})... `)

      const result = await uploadToCloudinary(
        product.imageBase64,
        product.id,
        product.name
      )

      if (result.success) {
        // Update product with Cloudinary URL and remove base64
        await productsCollection.updateOne(
          { id: product.id },
          {
            $set: {
              imageUrl: result.url,
              imagePublicId: result.publicId,
              updatedAt: new Date()
            },
            $unset: {
              imageBase64: ''
            }
          }
        )

        const base64Size = Buffer.from(product.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64').length
        totalBytesSaved += base64Size

        console.log(`✅ Migré (${(base64Size / 1024).toFixed(1)} KB économisés)`)
        console.log(`   URL: ${result.url}`)
        successCount++
      } else {
        console.log(`❌ Erreur: ${result.error}`)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 RÉSUMÉ DE LA MIGRATION')
    console.log('='.repeat(50))
    console.log(`✅ Produits migrés avec succès: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`💾 Espace économisé dans MongoDB: ${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await client.close()
    console.log('\n🔌 Connexion MongoDB fermée')
  }
}

// Run migration
migrateImages()

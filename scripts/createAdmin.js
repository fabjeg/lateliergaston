import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'

// ========================================
// CONFIGURATION
// ========================================
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'Admin123!'
// ========================================

async function createAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('Erreur: MONGODB_URI non defini dans .env')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('Connecte a MongoDB')

    const db = client.db('lateliergaston')
    const adminsCollection = db.collection('admins')

    // Verifier si l'admin existe deja
    const existingAdmin = await adminsCollection.findOne({
      username: ADMIN_USERNAME.toLowerCase()
    })

    if (existingAdmin) {
      console.log(`L'admin "${ADMIN_USERNAME}" existe deja.`)
      console.log('Voulez-vous mettre a jour le mot de passe ? Supprimez l\'admin et relancez le script.')
      process.exit(0)
    }

    // Hasher le mot de passe
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds)

    // Creer l'admin
    const admin = {
      username: ADMIN_USERNAME.toLowerCase(),
      passwordHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await adminsCollection.insertOne(admin)

    console.log('========================================')
    console.log('Admin cree avec succes!')
    console.log(`Username: ${ADMIN_USERNAME}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log('========================================')
    console.log('Vous pouvez maintenant vous connecter.')

  } catch (error) {
    console.error('Erreur:', error.message)
  } finally {
    await client.close()
  }
}

createAdmin()

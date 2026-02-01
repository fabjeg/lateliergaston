import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI non défini dans .env.local')
  process.exit(1)
}

async function resetAdmin() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Connecté à MongoDB')

    const db = client.db()
    const adminsCollection = db.collection('admins')

    // Définir le compte admin
    const username = 'laure'  // Stocké en minuscules
    const password = 'Laure123!'
    const saltRounds = 12

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Supprimer l'ancien compte s'il existe
    await adminsCollection.deleteOne({ username })

    // Créer le nouveau compte
    const result = await adminsCollection.insertOne({
      username,
      passwordHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('Compte admin créé/réinitialisé avec succès!')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('ID:', result.insertedId)

    // Nettoyer les anciennes sessions
    const sessionsCollection = db.collection('sessions')
    await sessionsCollection.deleteMany({})
    console.log('Sessions nettoyées')

    // Nettoyer les blocages
    const securityCollection = db.collection('security_events')
    await securityCollection.deleteMany({})
    console.log('Blocages de sécurité nettoyés')

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await client.close()
    console.log('Déconnecté de MongoDB')
  }
}

resetAdmin()

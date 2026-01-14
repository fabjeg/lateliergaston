import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import * as readline from 'readline'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function createAdmin() {
  console.log('\n=== Création d\'un compte administrateur ===\n')

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERREUR: MONGODB_URI n\'est pas défini dans .env.local')
    console.log('\nVeuillez créer un fichier .env.local avec:')
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lateliergaston')
    process.exit(1)
  }

  let client

  try {
    // Get admin credentials
    const username = await question('Nom d\'utilisateur: ')
    const password = await question('Mot de passe: ')
    const confirmPassword = await question('Confirmer le mot de passe: ')

    if (!username || username.length < 3) {
      console.error('\n❌ Le nom d\'utilisateur doit contenir au moins 3 caractères')
      process.exit(1)
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Les mots de passe ne correspondent pas')
      process.exit(1)
    }

    if (password.length < 8) {
      console.error('\n❌ Le mot de passe doit contenir au moins 8 caractères')
      process.exit(1)
    }

    console.log('\n🔄 Connexion à MongoDB...')

    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    console.log('✅ Connecté à MongoDB')

    const db = client.db('lateliergaston')
    const adminsCollection = db.collection('admins')

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ username })
    if (existingAdmin) {
      console.error(`\n❌ Un administrateur avec le nom "${username}" existe déjà`)
      process.exit(1)
    }

    // Hash password
    console.log('\n🔄 Hachage du mot de passe...')
    const passwordHash = await bcrypt.hash(password, 10)

    // Create admin
    const admin = {
      username,
      passwordHash,
      role: 'superadmin',
      createdAt: new Date()
    }

    await adminsCollection.insertOne(admin)

    console.log('\n✅ Compte administrateur créé avec succès!')
    console.log(`\nUsername: ${username}`)
    console.log('Role: superadmin')
    console.log('\n⚠️  Conservez ces identifiants en sécurité!')

  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
    rl.close()
  }
}

// Run the script
createAdmin()

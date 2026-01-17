import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { MongoClient } from 'mongodb'

async function unblock() {
  if (!process.env.MONGODB_URI) {
    console.error('Erreur: MONGODB_URI non defini dans .env')
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log('Connecte a MongoDB')

    const db = client.db('lateliergaston')

    // Supprimer tous les blocages IP
    const blockedIPs = db.collection('blocked_ips')
    const ipResult = await blockedIPs.deleteMany({})
    console.log(`${ipResult.deletedCount} IP(s) debloquee(s)`)

    // Supprimer tous les blocages utilisateurs
    const blockedUsers = db.collection('blocked_users')
    const userResult = await blockedUsers.deleteMany({})
    console.log(`${userResult.deletedCount} utilisateur(s) debloque(s)`)

    // Supprimer les tentatives echouees
    const failedAttempts = db.collection('failed_attempts')
    const attemptsResult = await failedAttempts.deleteMany({})
    console.log(`${attemptsResult.deletedCount} tentative(s) echouee(s) supprimee(s)`)

    console.log('========================================')
    console.log('Tout est debloque ! Tu peux te connecter.')
    console.log('========================================')

  } catch (error) {
    console.error('Erreur:', error.message)
  } finally {
    await client.close()
  }
}

unblock()

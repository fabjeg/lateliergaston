import { doc, setDoc, collection } from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Initialize Firestore with product data
 * This should be run once to populate the database
 *
 * To run this script:
 * 1. Uncomment the call to initializeProducts() in your main app (temporarily)
 * 2. Make sure Firebase is configured with valid credentials
 * 3. Run the app once
 * 4. Comment out the call again to prevent re-initialization
 */

const productsData = [
  {
    id: 1,
    name: 'Œuvre 1',
    price: 450.00,
    imageFilename: '561676007_17858710800524609_966159427435168161_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 2,
    name: 'Œuvre 2',
    price: 450.00,
    imageFilename: '566027323_17860076811524609_3890717275703473961_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 3,
    name: 'Œuvre 3',
    price: 450.00,
    imageFilename: '566943302_17860077999524609_139768563597202447_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 4,
    name: 'Œuvre 4',
    price: 450.00,
    imageFilename: '572235425_17861416944524609_3463920233784334214_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 5,
    name: 'Œuvre 5',
    price: 450.00,
    imageFilename: '572844840_17861111490524609_975655948130670703_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 6,
    name: 'Œuvre 6',
    price: 450.00,
    imageFilename: '573313877_17862175311524609_6903431562385700038_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 7,
    name: 'Œuvre 7',
    price: 450.00,
    imageFilename: '573523271_17861910591524609_5276602963239441975_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 8,
    name: 'Œuvre 8',
    price: 450.00,
    imageFilename: '576458278_17862690423524609_5149917018225823158_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 9,
    name: 'Œuvre 9',
    price: 450.00,
    imageFilename: '588832750_17865251334524609_3240054877398157525_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
  {
    id: 10,
    name: 'Œuvre 10',
    price: 450.00,
    imageFilename: '597807467_17865995514524609_7025555680287479999_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    isSold: false,
    soldAt: null,
    stripePaymentId: null,
    purchaserEmail: null
  },
]

export async function initializeProducts() {
  try {
    console.log('Starting product initialization...')

    for (const product of productsData) {
      const { id, ...productData } = product
      const docRef = doc(db, 'artworks', String(id))

      await setDoc(docRef, productData)
      console.log(`✓ Product ${id} initialized`)
    }

    console.log('✅ All products initialized successfully!')
    return { success: true, count: productsData.length }
  } catch (error) {
    console.error('❌ Error initializing products:', error)
    throw error
  }
}

// Export products data for reference
export { productsData }

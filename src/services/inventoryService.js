import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  writeBatch,
  runTransaction
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION_NAME = 'artworks'

/**
 * Get all products from Firestore with their sold status
 */
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
    const products = []

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, String(productId))
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    } else {
      throw new Error(`Product ${productId} not found`)
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

/**
 * Mark products as sold in Firestore
 * This should only be called by the webhook after payment confirmation
 */
export async function markAsSold(productIds, paymentData = {}) {
  try {
    const batch = writeBatch(db)

    for (const productId of productIds) {
      const docRef = doc(db, COLLECTION_NAME, String(productId))
      batch.update(docRef, {
        isSold: true,
        soldAt: new Date(),
        stripePaymentId: paymentData.paymentId || null,
        purchaserEmail: paymentData.email || null
      })
    }

    await batch.commit()
    return { success: true }
  } catch (error) {
    console.error('Error marking products as sold:', error)
    throw error
  }
}

/**
 * Check if products are available (not sold)
 * Returns array of unavailable product IDs
 */
export async function checkAvailability(productIds) {
  try {
    const unavailable = []

    for (const productId of productIds) {
      const product = await getProduct(productId)
      if (product.isSold) {
        unavailable.push(productId)
      }
    }

    return unavailable
  } catch (error) {
    console.error('Error checking availability:', error)
    throw error
  }
}

/**
 * Get all sold products
 */
export async function getSoldProducts() {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('isSold', '==', true))
    const querySnapshot = await getDocs(q)
    const soldProducts = []

    querySnapshot.forEach((doc) => {
      soldProducts.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return soldProducts
  } catch (error) {
    console.error('Error fetching sold products:', error)
    throw error
  }
}

/**
 * Get all available products
 */
export async function getAvailableProducts() {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('isSold', '==', false))
    const querySnapshot = await getDocs(q)
    const availableProducts = []

    querySnapshot.forEach((doc) => {
      availableProducts.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return availableProducts
  } catch (error) {
    console.error('Error fetching available products:', error)
    throw error
  }
}

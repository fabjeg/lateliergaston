import { createContext, useContext, useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

const InventoryContext = createContext()

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}

export function InventoryProvider({ children }) {
  const [soldProducts, setSoldProducts] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Timeout pour éviter d'attendre trop longtemps si Firebase n'est pas configuré
    const timeoutId = setTimeout(() => {
      console.warn('Firebase timeout - continuing without inventory management')
      setLoading(false)
      setError('Firebase non configuré - fonctionnement en mode local')
    }, 5000) // 5 secondes max

    // Set up real-time listener for artworks collection
    const unsubscribe = onSnapshot(
      collection(db, 'artworks'),
      (snapshot) => {
        clearTimeout(timeoutId) // Annuler le timeout si succès
        const sold = new Set()
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.isSold) {
            // Store as number for consistency with product IDs
            sold.add(Number(doc.id))
          }
        })
        setSoldProducts(sold)
        setLoading(false)
        setError(null)
      },
      (err) => {
        clearTimeout(timeoutId) // Annuler le timeout si erreur
        console.error('Error listening to inventory:', err)
        setError(err.message)
        setLoading(false)
        // Continue sans Firebase - tous les produits sont disponibles
      }
    )

    // Cleanup listener on unmount
    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  // Check if a product is sold
  const isSold = (productId) => {
    return soldProducts.has(Number(productId))
  }

  // Get count of available products
  const getAvailableCount = () => {
    return 10 - soldProducts.size
  }

  // Get count of sold products
  const getSoldCount = () => {
    return soldProducts.size
  }

  const value = {
    soldProducts,
    isSold,
    loading,
    error,
    getAvailableCount,
    getSoldCount,
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

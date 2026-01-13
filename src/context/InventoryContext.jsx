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
    // Set up real-time listener for artworks collection
    const unsubscribe = onSnapshot(
      collection(db, 'artworks'),
      (snapshot) => {
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
        console.error('Error listening to inventory:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    // Cleanup listener on unmount
    return () => unsubscribe()
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

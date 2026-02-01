import { createContext, useContext, useState } from 'react'

const InventoryContext = createContext()

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider')
  }
  return context
}

export function InventoryProvider({ children }) {
  // L'inventaire est géré via le statut des produits en base de données
  // Le statut "sold" indique qu'un produit est vendu
  const [soldProducts] = useState(new Set())
  const loading = false
  const error = null

  // Check if a product is sold
  const isSold = (productId) => {
    return soldProducts.has(Number(productId))
  }

  // Get count of available products (tous disponibles pour l'instant)
  const getAvailableCount = () => {
    return 10
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

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getAllProducts } from '../services/productApi'

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

  const loadInventory = useCallback(async () => {
    try {
      const result = await getAllProducts()
      if (result.success) {
        const soldIds = new Set(
          result.products
            .filter(p => p.status === 'sold')
            .map(p => Number(p.id))
        )
        setSoldProducts(soldIds)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const isSold = useCallback((productId) => {
    return soldProducts.has(Number(productId))
  }, [soldProducts])

  const getAvailableCount = useCallback(() => {
    return 0
  }, [])

  const getSoldCount = useCallback(() => {
    return soldProducts.size
  }, [soldProducts])

  const refresh = useCallback(() => {
    loadInventory()
  }, [loadInventory])

  const value = useMemo(() => ({
    soldProducts,
    isSold,
    loading,
    error,
    getAvailableCount,
    getSoldCount,
    refresh,
  }), [soldProducts, isSold, loading, error, getAvailableCount, getSoldCount, refresh])

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

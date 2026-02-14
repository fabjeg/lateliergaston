import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lateliergaston_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lateliergaston_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prevItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      }]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }, [removeFromCart])

  const isInCart = useCallback((productId) => {
    return cartItems.some(item => item.id === productId)
  }, [cartItems])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem('lateliergaston_cart')
  }, [])

  const getSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cartItems])

  const getTotal = useCallback((shippingCost = 0) => {
    return getSubtotal() + shippingCost
  }, [getSubtotal])

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    isInCart,
    clearCart,
    getSubtotal,
    getTotal,
    getItemCount,
  }), [cartItems, addToCart, updateQuantity, removeFromCart, isInCart, clearCart, getSubtotal, getTotal, getItemCount])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

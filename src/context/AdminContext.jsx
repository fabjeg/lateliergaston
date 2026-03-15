import { createContext, useState, useEffect, useRef } from 'react'

export const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verify session on mount
  useEffect(() => {
    verifySession()
  }, [])

  // Redirection automatique si une requête admin reçoit un 401
  useEffect(() => {
    const handler = () => setAdmin(null)
    window.addEventListener('admin-unauthorized', handler)
    return () => window.removeEventListener('admin-unauthorized', handler)
  }, [])

  // Vérification périodique de la session (toutes les 3 minutes)
  const intervalRef = useRef(null)
  useEffect(() => {
    if (!admin) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(verifySession, 3 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [admin]) // eslint-disable-line react-hooks/exhaustive-deps


  /**
   * Verify if there's an active session
   */
  const verifySession = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setAdmin(data.data.admin)
      } else {
        setAdmin(null)
      }
    } catch (err) {
      console.error('Session verification error:', err)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Login admin
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (username, password) => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        setAdmin(data.data.admin)
        return { success: true }
      } else {
        setError(data.error || 'Erreur de connexion')
        return { success: false, error: data.error }
      }
    } catch (err) {
      const errorMsg = 'Erreur de connexion au serveur'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout admin
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setAdmin(null)
    }
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return admin !== null
  }

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    verifySession,
    isAuthenticated
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

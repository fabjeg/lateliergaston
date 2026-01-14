import { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'

/**
 * Hook to access admin authentication context
 * @returns {object} Admin context value
 */
export function useAdminAuth() {
  const context = useContext(AdminContext)

  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminProvider')
  }

  return context
}

import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import Loader from '../Loader'

/**
 * Protected route component that requires authentication
 * Redirects to login page if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  // Render children if authenticated
  return children
}

export default ProtectedRoute

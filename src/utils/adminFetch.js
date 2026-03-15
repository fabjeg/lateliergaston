/**
 * Wrapper autour de fetch pour les appels API admin.
 * Dispatche un event 'admin-unauthorized' si le serveur répond 401,
 * ce qui déclenche la déconnexion et la redirection vers /admin/login.
 */
export async function adminFetch(url, options = {}) {
  const response = await fetch(url, options)
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('admin-unauthorized'))
  }
  return response
}

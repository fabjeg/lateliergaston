import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminHelpBot from './components/admin/AdminHelpBot'
import { CartProvider } from './context/CartContext'
import { InventoryProvider } from './context/InventoryContext'
import { AdminProvider } from './context/AdminContext'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

// Lazy loading des pages - chargées uniquement quand nécessaire
const HeroPage = lazy(() => import('./pages/HeroPage'))
const Accueil = lazy(() => import('./pages/Accueil'))
const Gallery = lazy(() => import('./pages/Gallery'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Shop = lazy(() => import('./pages/Shop'))
const Cart = lazy(() => import('./pages/Cart'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Success = lazy(() => import('./pages/Success'))
const SurMesure = lazy(() => import('./pages/SurMesure'))

// Admin pages - lazy loaded
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminCollections = lazy(() => import('./pages/admin/AdminCollections'))
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminReorder = lazy(() => import('./pages/admin/AdminReorder'))
const AdminColors = lazy(() => import('./pages/admin/AdminColors'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Layout() {
  const location = useLocation()
  const isHeroPage = location.pathname === '/'
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="app">
      <ScrollToTop />
      {!isHeroPage && !isAdmin && <Header />}
      <main className={isAdmin ? 'no-header' : ''}>
        <Suspense fallback={<Loader />}>
        <Routes>
          {/* Hero page without header/footer */}
          <Route path="/" element={<HeroPage />} />

          {/* Public routes */}
          <Route path="/accueil" element={<Accueil />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/success" element={<Success />} />
          <Route path="/sur-mesure" element={<SurMesure />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/collections"
            element={
              <ProtectedRoute>
                <AdminCollections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/about"
            element={
              <ProtectedRoute>
                <AdminAbout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/accueil"
            element={
              <ProtectedRoute>
                <AdminAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reorder"
            element={
              <ProtectedRoute>
                <AdminReorder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/colors"
            element={
              <ProtectedRoute>
                <AdminColors />
              </ProtectedRoute>
            }
          />
        </Routes>
        </Suspense>
      </main>
      {isAdmin && <AdminHelpBot />}
      {!isHeroPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AdminProvider>
          <InventoryProvider>
            <CartProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Layout />
              </Router>
            </CartProvider>
          </InventoryProvider>
        </AdminProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HeroPage from './pages/HeroPage'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import ProductDetail from './pages/ProductDetail'
import Success from './pages/Success'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { CartProvider } from './context/CartContext'
import { InventoryProvider } from './context/InventoryContext'
import { AdminProvider } from './context/AdminContext'
import './App.css'

function Layout() {
  const location = useLocation()
  const isHeroPage = location.pathname === '/'

  return (
    <div className="app">
      {!isHeroPage && <Header />}
      <main>
        <Routes>
          {/* Hero page without header/footer */}
          <Route path="/" element={<HeroPage />} />

          {/* Public routes */}
          <Route path="/gallery" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/success" element={<Success />} />

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
        </Routes>
      </main>
      {!isHeroPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AdminProvider>
      <InventoryProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout />
          </Router>
        </CartProvider>
      </InventoryProvider>
    </AdminProvider>
  )
}

export default App

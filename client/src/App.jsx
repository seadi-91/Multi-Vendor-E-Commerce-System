import Cart from './pages/cart/Cart';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './context/ProtectedRoute';
import GuestRoute from './context/GuestRoute';
import AdminDashboard from './pages/dashbord/admin/AdminDashboard';
import CustomerDashboard from './pages/dashbord/customer/customer';
import FarmerDashboard from './pages/dashbord/farmer/farmer';
import Login from './pages/login/login';
import Register from './pages/regsiter/Register';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';
import Checkout from './pages/checkout/Checkout';
import Orders from './pages/orders/Orders';
import Home from './pages/home/Home';
import Contact from './pages/contact/Contact';
import Favorites from './pages/favorites/Favorites';
import Product from './pages/dashbord/customer/product/Product';
import Market from './pages/market/Market';
import { ROLES } from './context/roles';

function App() {
  const Settings = React.lazy(() => import('./pages/dashbord/customer/settings'));

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products" element={<Product />} />

          {/* Guest Routes - Only accessible when not authenticated */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes (Changed path to support nested routes) */}
          <Route
            path="/customer/dashboard/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/products"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Navigate to="/market" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Settings />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/wishlist" element={<Navigate to="/favorites" replace />} />
          <Route
            path="/customer/checkout"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* Farmer Routes */}
          <Route
            path="/farmer/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.FARMER]}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
import Cart from './pages/cart/Cart';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './context/ProtectedRoute';
import AdminDashboard from './pages/dashbord/admin/AdminDashboard';
import CustomerDashboard from './pages/dashbord/customer/customer';
import FarmerDashboard from './pages/dashbord/farmer/farmer';
import Login from './pages/login/login';
import Register from './pages/regsiter/Register';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';
import Checkout from './pages/checkout/Checkout';
import Orders from './pages/orders/Orders';
import Home from './pages/home/Home'; // Add this import
import About from './pages/about/About';
import Contact from './pages/contact/Contact';

function App() {
  const Settings = React.lazy(() => import('./pages/dashbord/customer/settings'));
  
  return (
    <>
      <Router>
        <Routes>
          {/* Add Home route as the root path */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/*"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/checkout" element={<Checkout />} />
          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/settings"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Settings />
                </React.Suspense>
              </ProtectedRoute>
            }
          />
          {/* Update the catch-all route to redirect to home instead of login */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
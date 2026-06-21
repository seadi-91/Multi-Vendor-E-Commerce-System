import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import Header from './header/Header';
import { useCart } from '../../../context/CartContext';
import CustomerFooter from './footer/Footer';

import Home from './home/Home';
import Product from './product/Product';
import { Routes, Route } from 'react-router-dom';
const Settings = React.lazy(() => import('./settings'));

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  const { cartCount } = useCart();
  return (
    <div className="dashboard customer-dashboard">
      <Header cartCount={cartCount} user={user} onLogout={logout} />
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="settings" element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Settings />
            </React.Suspense>
          } />
          {/* Add more customer routes as needed */}
        </Routes>
      </main>
      <CustomerFooter />
    </div>
  );
};

export default CustomerDashboard;
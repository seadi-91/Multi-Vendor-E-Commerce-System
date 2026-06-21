import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import FarmerHeader from './header/Header';
import FarmerHome from './home/Home';
import FarmerFooter from './footer/Footer';
import AddProduct from './product/AddProduct';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard farmer-dashboard">
      <FarmerHeader user={user} onLogout={logout} />
      <main className="dashboard-content">
        <Routes>
          <Route path="/dashboard" element={<FarmerHome />} />
          <Route path="/products/add" element={<AddProduct />} />
          {/* Add more farmer routes here */}
        </Routes>
      </main>
      <FarmerFooter />
    </div>
  );
};

export default FarmerDashboard;
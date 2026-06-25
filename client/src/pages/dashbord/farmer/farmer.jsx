import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardHeader from './DashboardHeader';
import FarmerHome from './home/Home';
import AddProduct from './product/AddProduct';
import FarmerSidebar from './FarmerSidebar';
import AddProductDialog from './components/AddProductDialog';
import Profile from './profile/Profile';
import Settings from './settings/Settings';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const handleAddProductSuccess = () => {
    // Refresh products or perform any necessary updates
    setIsAddProductOpen(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <FarmerSidebar user={user} onLogout={logout} onAddProduct={() => setIsAddProductOpen(true)} />
        <SidebarInset className="flex-1 min-w-0 h-full overflow-y-auto">
          <DashboardHeader user={user} onLogout={logout} />
          <main className="p-6">
            <Routes>
              <Route path="/dashboard" element={<FarmerHome />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              {/* Add more farmer routes here */}
            </Routes>
          </main>
        </SidebarInset>
      </div>
      
      {/* Global Add Product Dialog */}
      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSuccess={handleAddProductSuccess}
      />
    </SidebarProvider>
  );
};

export default FarmerDashboard;
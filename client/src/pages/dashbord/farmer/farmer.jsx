import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, MessageSquare } from 'lucide-react';
import FarmerHome from './home/Home';
import AddProduct from './product/AddProduct';
import FarmerSidebar from './FarmerSidebar';
import Profile from './profile/Profile';
import Settings from './settings/Settings';
import FarmerOrders from './Orders';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-row w-full h-screen bg-slate-50/50">
        {/* Sidebar */}
        <div className={`hidden md:block ${isSidebarCollapsed ? 'w-28 flex-shrink-0 transition-all duration-300 ease-in-out' : 'w-64 flex-shrink-0 transition-all duration-300 ease-in-out'}`}>
          <FarmerSidebar
            user={user}
            onLogout={logout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <nav className="flex flex-row items-center justify-between w-full px-6 py-4 bg-white border-b">
            {/* Left - Greeting */}
            <div className="flex items-center shrink-0 gap-3">
              <div className="md:hidden">
                <SidebarTrigger className="p-2 text-slate-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Welcome back, {user?.name || 'test abebe'}.</h1>
                <p className="text-sm text-slate-600">Here's what's happening on your farm.</p>
              </div>
            </div>

            {/* Middle - Search Bar */}
            <form className="relative flex-grow max-w-md mx-4 hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search products, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10 bg-slate-50 border-slate-200 text-sm rounded-md"
              />
            </form>

            {/* Right - Notifications, Messages, Profile */}
            <div className="flex items-center gap-4 shrink-0">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                <MessageSquare className="h-4 w-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </Button>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                <Bell className="h-4 w-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
                  {user?.name?.charAt(0) || 'T'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-slate-900">{user?.name || 'Test Abebe'}</p>
                  <p className="text-[10px] text-slate-600">{user?.farmName || 'Farm Owner'}</p>
                </div>
              </div>
            </div>
          </nav>

          {/* Dashboard Body */}
          <div className="flex-1 w-full">
            <main className="w-full p-6 md:p-10 overflow-y-auto h-full">
              <Routes>
                <Route path="/dashboard" element={<FarmerHome />} />
                <Route path="/products" element={<AddProduct />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/orders" element={<FarmerOrders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FarmerDashboard;
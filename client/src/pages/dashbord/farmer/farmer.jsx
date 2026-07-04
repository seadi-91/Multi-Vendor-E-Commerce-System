import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Search, Bell, MessageSquare, Menu, LayoutDashboard, Package, ShoppingBag, TrendingUp, BarChart3, User, Settings as SettingsIcon, LogOut, Leaf } from 'lucide-react';
import FarmerHome from './home/Home';
import AddProduct from './product/AddProduct';
import FarmerSidebar from './FarmerSidebar';
import Profile from './profile/Profile';
import Settings from './settings/Settings';
import FarmerOrders from './Orders';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      // Navigate to products page with search query
      navigate('/farmer/products', { state: { searchQuery: query } });
    }
  };

  useEffect(() => {
    // Close mobile drawer on route change
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Close profile dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SidebarProvider>
      <div className="flex flex-row w-full h-screen bg-slate-50/50 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden md:block ${isSidebarCollapsed ? 'w-28 flex-shrink-0 transition-all duration-300 ease-in-out' : 'w-64 flex-shrink-0 transition-all duration-300 ease-in-out'}`}>
          <FarmerSidebar
            user={user}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-[100] bg-white border border-slate-200 shadow-md">
              <Menu className="h-5 w-5 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 z-[100] overflow-y-auto">
            <div className="h-full flex flex-col bg-white">
              {/* Mobile Header */}
              <div className="bg-green-600 p-4 border-b border-green-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">FarmConnect</h2>
                    <p className="text-xs text-green-100">Farmer Portal</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => { navigate('/farmer/dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <LayoutDashboard size={18} />
                  <span className="font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/products'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname.includes('/farmer/products') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Package size={18} />
                  <span className="font-medium">My Products</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/orders'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/orders' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <ShoppingBag size={18} />
                  <span className="font-medium">Orders</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/earnings'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/earnings' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <TrendingUp size={18} />
                  <span className="font-medium">Earnings</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/analytics'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/analytics' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <BarChart3 size={18} />
                  <span className="font-medium">Analytics</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/messages'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/messages' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <MessageSquare size={18} />
                  <span className="font-medium">Messages</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/notifications'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/notifications' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Bell size={18} />
                  <span className="font-medium">Notifications</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/profile'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/profile' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <User size={18} />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => { navigate('/farmer/settings'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/farmer/settings' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <SettingsIcon size={18} />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden px-4 relative">
          {/* Header */}
          <nav className="flex flex-row items-center justify-between w-full px-4 sm:px-6 py-4 bg-white border-b relative z-10">
            {/* Left - Greeting */}
            <div className="flex items-center shrink-0 gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900">Welcome back, {user?.name || 'test abebe'}.</h1>
                <p className="text-xs sm:text-sm text-slate-600">Here's what's happening on your farm.</p>
              </div>
            </div>

            {/* Middle - Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-grow max-w-md mx-2 sm:mx-4 hidden sm:block">
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
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                <MessageSquare className="h-4 w-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </Button>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-lg">
                <Bell className="h-4 w-4 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
              </Button>
              <div className="relative" ref={profileDropdownRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-8 px-2 rounded-lg"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
                    {user?.name?.charAt(0) || 'T'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium text-slate-900">{user?.name || 'Test Abebe'}</p>
                    <p className="text-[10px] text-slate-600">{user?.farmName || 'Farm Owner'}</p>
                  </div>
                </Button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">My Account</p>
                    </div>
                    <button
                      onClick={() => { navigate('/farmer/profile'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => { navigate('/farmer/settings'); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 my-2"></div>
                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Dashboard Body */}
          <div className="flex-1 w-full">
            <main className="w-full px-2 sm:px-4 py-4 sm:py-6 md:px-10 overflow-y-auto h-full">
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
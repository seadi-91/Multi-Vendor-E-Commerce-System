import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';

import CustomerFooter from './footer/Footer';
import MyOrders from './order';
import Product from './product/Product';

/* ==========================================================================
   SUB-COMPONENT: CLEANED SIDEBAR (Removed Profile, Settings, etc.)
   ========================================================================== */
const Sidebar = ({ cartCount, favoritesCount }) => {
  const baseMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 font-medium transition-all hover:bg-gray-50 hover:text-green-600 group";
  const activeMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all bg-green-50 text-green-600";

  return (
    <aside className="w-64 h-fit bg-white border-r border-gray-100 p-6 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold">FC</span>
          </div>
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-green-600">Farm</span>
            <span className="text-gray-800">Connect</span>
          </h1>
        </div>
        <p className="text-xs text-gray-400 font-medium mb-8 pl-1">Fresh from Farm to You</p>

        {/* Core Shopping Sidebar Links */}
        <nav className="space-y-1">
          <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🏠</span> <span>Dashboard</span>
            </div>
          </NavLink>

          <NavLink to="/customer/dashboard/products" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🥗</span> <span>Products</span>
            </div>
          </NavLink>

          <NavLink to="/customer/dashboard/orders" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🛍️</span> <span>My Orders</span>
            </div>
          </NavLink>

          <NavLink to="/favorites" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🤍</span> <span>Wishlist</span>
            </div>
            {favoritesCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
            )}
          </NavLink>

          <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass}>
            <div className="flex items-center gap-3">
              <span className="text-lg">🛒</span> <span>Cart</span>
            </div>
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cartCount || 2}</span>
          </NavLink>


        </nav>
      </div>

      {/* Sidebar Promo Card */}
      <div className="bg-green-50 rounded-2xl p-4 mt-6 relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-green-800 font-bold text-base mb-1">Fresh Deals!</h3>
          <p className="text-xs text-gray-600 mb-3 max-w-[120px]">Get up to 20% off on selected products</p>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors">
            Shop Now
          </button>
        </div>
        <span className="absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 pointer-events-none group-hover:scale-110 transition-transform">🧺</span>
      </div>
    </aside>
  );
};

/* ==========================================================================
   SUB-COMPONENT: HEADER WITH DEDICATED 3-DOT MENUS
   ========================================================================== */
const DashboardHeader = ({ user, cartCount, onLogout }) => {
  const navigate = useNavigate();
  const [favoritesCount, setFavoritesCount] = useState(0);

  const updateFavoritesCount = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setFavoritesCount(favorites.filter(f => !String(f).startsWith('cat-')).length);
    }
  };

  useEffect(() => {
    updateFavoritesCount();
    window.addEventListener('storage', updateFavoritesCount);
    window.addEventListener('favoritesUpdated', updateFavoritesCount);
    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Universal Search Bar */}
      <div className="flex items-center w-full max-w-xl bg-gray-50 border border-gray-200 rounded-xl overflow-hidden px-4 py-1.5 focus-within:border-green-500 transition-colors">
        <input
          type="text"
          placeholder="Search for products or sellers..."
          className="bg-transparent w-full text-sm text-gray-700 placeholder-gray-400 outline-none py-1"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </div>

      {/* Global Action Icons */}
      <div className="flex items-center gap-6">
        <div onClick={() => navigate('/customer/dashboard/notifications')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </div>
        <div onClick={() => navigate('/favorites')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🤍</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{favoritesCount}</span>
          )}
        </div>
        <div onClick={() => navigate('/customer/cart')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🛒</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount || 2}</span>
        </div>

        {/* User Interactive Menu Context */}
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200 relative group">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"}
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1 cursor-default">
              Hi, {user?.name || "Selam!"}
            </p>
          </div>

          <button className="text-gray-400 hover:text-gray-700 font-bold px-1 text-xl transition-colors ml-1 focus:outline-none">
            &#8942;
          </button>

          {/* 3-Dot Dropdown Actions Panel */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">

            <button onClick={() => navigate('/customer/dashboard/notifications')} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <div className="flex items-center gap-3">
                <span>🔔</span> Notifications
              </div>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button onClick={() => navigate('/customer/dashboard/reviews')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <span>⭐</span> My Reviews
            </button>
            <button onClick={() => navigate('/customer/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <span>⚙️</span> Settings
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium text-left">
              <span>📤</span> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ==========================================================================
   SUB-COMPONENT: DASHBOARD HOME MATRIX VIEW
   ========================================================================== */
const HomeDashboardView = ({ user }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);

  const updateFavoritesCount = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setFavoritesCount(favorites.filter(f => !String(f).startsWith('cat-')).length);
    }
  };

  useEffect(() => {
    updateFavoritesCount();
    window.addEventListener('storage', updateFavoritesCount);
    window.addEventListener('favoritesUpdated', updateFavoritesCount);
    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Welcome back, {user?.name || "Selam!"} <span>👋</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">🛍️</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">12</h4>
            <p className="text-xs text-gray-400 font-medium">Total Orders</p>
            <Link to="orders" className="text-xs text-green-600 font-semibold mt-1 inline-block hover:underline">View all orders</Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">🚚</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">3</h4>
            <p className="text-xs text-gray-400 font-medium">Ongoing Orders</p>
            <Link to="orders" className="text-xs text-green-600 font-semibold mt-1 inline-block hover:underline">Track your orders</Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold">🧡</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">{favoritesCount}</h4>
            <p className="text-xs text-gray-400 font-medium">Wishlist Items</p>
            <Link to="/favorites" className="text-xs text-green-600 font-semibold mt-1 inline-block hover:underline">View wishlist</Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold">🪪</div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">$245.80</h4>
            <p className="text-xs text-gray-400 font-medium">Total Spent</p>
            <Link to="spending" className="text-xs text-green-600 font-semibold mt-1 inline-block hover:underline">View spending</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link to="orders" className="text-xs font-semibold text-green-600 hover:underline">View all orders</Link>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center text-2xl border border-amber-100 shrink-0">☕</div>
              <div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-gray-900 truncate">Ethiopian Coffee Beans</h4><p className="text-xs text-gray-400 truncate">250g, Sidamo Grade 1</p></div>
              <div className="text-right shrink-0"><p className="text-sm font-bold text-gray-900">$24.50</p><p className="text-xs text-gray-400">Qty: 1</p></div>
              <div className="text-right shrink-0 min-w-[90px]"><span className="inline-block text-[11px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-600">Processing</span><p className="text-[10px] text-gray-400 mt-1">May 12, 2024</p></div>
              <span className="text-gray-300 font-bold">❯</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN COMPONENT: CUSTOMER DASHBOARD CONTAINER
   ========================================================================== */
const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const Settings = React.lazy(() => import('./settings'));

  const updateFavoritesCount = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setFavoritesCount(favorites.filter(f => !String(f).startsWith('cat-')).length);
    }
  };

  useEffect(() => {
    updateFavoritesCount();
    window.addEventListener('storage', updateFavoritesCount);
    window.addEventListener('favoritesUpdated', updateFavoritesCount);
    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-800 antialiased font-sans">
      <div className="flex flex-1">
        <Sidebar cartCount={cartCount} favoritesCount={favoritesCount} />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader user={user} cartCount={cartCount} onLogout={logout} />

          <div className="flex-1 overflow-y-auto">
            <main className="flex-1">
              <Routes>
                <Route index element={<HomeDashboardView user={user} />} />

                <Route path="products" element={<Product />} />
                <Route path="settings" element={
                  <React.Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading Module...</div>}>
                    <Settings />
                  </React.Suspense>
                } />

                {/* Router view spaces driven by the header links */}
                <Route path="orders" element={<MyOrders />} />
                <Route path="wishlist" element={<div className="p-8 font-bold text-xl text-gray-800">Wishlist Products Deck</div>} />
                <Route path="cart" element={<div className="p-8 font-bold text-xl text-gray-800">Local Basket Viewport</div>} />
                <Route path="notifications" element={<div className="p-8 font-bold text-xl text-gray-800">Notifications Push Inbox</div>} />
                <Route path="addresses" element={<div className="p-8 font-bold text-xl text-gray-800">Addresses Panel Manager</div>} />
                <Route path="reviews" element={<div className="p-8 font-bold text-xl text-gray-800">My Product Reviews Deck</div>} />

              </Routes>
            </main>
          </div>
        </div>
      </div>

      <CustomerFooter />
    </div>
  );
};

export default CustomerDashboard;
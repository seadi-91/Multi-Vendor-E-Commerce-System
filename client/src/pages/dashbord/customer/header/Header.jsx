import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../../context/CartContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Bell, MapPin,
  Menu, ChevronDown, Package, Home, Store,
  History, Settings, LogOut, Heart, BarChart3, Sun, Moon, Monitor
} from 'lucide-react';

const CustomerHeader = ({ user, onLogout, notificationCount = 2 }) => {
  const { cart, cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('vegetables');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const searchRef = useRef(null);
  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const cartRef = useRef(null);

  // Categories with appropriate icons
  const categories = [
    { id: 'vegetables', label: 'Vegetables', icon: '🥦', color: '#10b981' },
    { id: 'fruits', label: 'Fruits', icon: '🍎', color: '#ef4444' },
    { id: 'dairy', label: 'Dairy', icon: '🥛', color: '#f59e0b' },
    { id: 'grains', label: 'Grains', icon: '🌾', color: '#8b5cf6' },
    { id: 'eggs', label: 'Eggs', icon: '🥚', color: '#f97316' },
    { id: 'meat', label: 'Meat & Fish', icon: '🥩', color: '#dc2626' },
    { id: 'honey', label: 'Honey', icon: '🍯', color: '#d97706' },
  ];

  // Navigation links
  const navLinks = [
    { path: '/customer/dashboard', label: 'Home' },
    { path: '/customer/orders', label: 'Orders' },
    // Track Order removed
  ];

  // User menu items
  const userMenuItems = [
    { label: 'My Profile', icon: <User size={18} />, path: '/customer/profile' },
    { label: 'My Orders', icon: <BarChart3 size={18} />, path: '/customer/orders' },
    { label: 'Favorites', icon: <Heart size={18} />, path: '/favorites' },
    { label: 'Address Book', icon: <MapPin size={18} />, path: '/customer/addresses' },
    { label: 'Notifications', icon: <Bell size={18} />, path: '/customer/notifications' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/customer/settings' },
  ];

  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'system', label: 'System', icon: <Monitor size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  ];

  // Delivery address
  const deliveryAddress = {
    primary: "Home - 123 Green Street",
    deliveryTime: "2-3 hours"
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
    navigate(`/customer/products?category=${categoryId}`);
  };

  // Calculate real cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCartPreview(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && window.innerWidth < 768) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    localStorage.setItem('theme', theme);
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-[1000] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] font-sans">
        {/* Top Bar - Desktop & Mobile */}
        <div className="py-3 border-b border-slate-100">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center justify-between gap-4 relative">
              {/* Logo Section */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Back Button - navigates to home */}
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center p-2 rounded-lg border-none bg-transparent cursor-pointer text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Back to home"
                  title="Back to home"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  className="hidden md:flex items-center justify-center p-2 rounded-lg border-none bg-transparent cursor-pointer text-slate-600 hover:bg-slate-50"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <Menu size={24} />
                </button>

                <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => navigate('/customer/dashboard')}>
                  <span className="text-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 bg-clip-text text-transparent">🌾</span>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-extrabold text-slate-800 m-0 leading-tight tracking-tight">FarmFresh</h1>
                    <span className="text-xs text-slate-500 font-medium">Direct from Farm</span>
                  </div>
                </div>
              </div>

              {/* Search Section - Desktop */}
              <div className="flex-1 max-w-[600px] relative hidden md:block" ref={searchRef}>
                <form onSubmit={handleSearch} className="w-full">
                  <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden bg-white transition-all focus-within:border-emerald-500 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]">
                    <input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-3 border-none outline-none text-sm text-slate-800 bg-transparent placeholder:text-slate-400"
                      aria-label="Search products"
                    />

                    <button type="submit" className="px-5 bg-emerald-500 border-none cursor-pointer transition-colors hover:bg-emerald-600 flex items-center justify-center" aria-label="Search">
                      <Search size={20} className="text-white" />
                    </button>
                  </div>
                </form>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile Search Toggle */}
                <button
                  className="hidden md:flex items-center justify-center p-2 rounded-lg border-none bg-transparent cursor-pointer text-slate-600 hover:bg-slate-50"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  aria-label="Search"
                >
                  <Search size={22} />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white cursor-pointer flex items-center justify-center transition-all hover:bg-slate-50 hover:border-slate-300"
                    onClick={() => navigate('/customer/notifications')}
                    aria-label={`Notifications (${notificationCount})`}
                  >
                    <Bell size={22} className="text-slate-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px]">{notificationCount}</span>
                    )}
                  </button>
                </div>

                {/* Cart */}
                <div className="relative" ref={cartRef}>
                  <button
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300"
                    onClick={() => navigate('/customer/cart')}
                    aria-label={`Cart (${cartCount} items)`}
                  >
                    <ShoppingCart size={22} className="text-slate-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-[3px]">{cartCount}</span>
                    )}
                    <span className="text-sm font-medium text-slate-600 hidden sm:inline">Cart</span>
                  </button>

                  {/* Cart Preview */}
                  {showCartPreview && (
                    <div className="absolute top-[calc(100%+10px)] right-0 w-[350px] bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-[1002] border border-slate-200 overflow-hidden animate-slide-down max-sm:w-[300px] max-sm:right-[-20px]">
                      <div className="px-4 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="m-0 text-base text-slate-800 font-semibold">Your Cart ({cartCount})</h3>
                        <button
                          className="bg-none border-none text-xl text-slate-500 cursor-pointer p-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200"
                          onClick={() => setShowCartPreview(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="max-h-[250px] overflow-y-auto p-4">
                        {cart.length === 0 && <div className="text-slate-500 text-center py-4">Your cart is empty.</div>}
                        {cart.map(item => (
                          <div key={item._id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
                            <div className="flex-1">
                              <h4 className="m-0 mb-1 text-sm text-slate-800 font-semibold">{item.name}</h4>
                              <div className="flex gap-3 text-xs text-slate-500">
                                <span className="bg-slate-200 px-2 py-[2px] rounded">{item.quantity}</span>
                                <span>{item.price} ETB</span>
                              </div>
                            </div>
                            <div className="font-bold text-slate-800 text-sm">
                              {item.quantity * item.price} ETB
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-slate-600 font-semibold">Total:</span>
                          <span className="text-xl font-extrabold text-slate-800">{cartTotal.toFixed(2)} ETB</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 py-3 rounded-xl font-semibold cursor-pointer transition-all border-2 border-transparent bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                            onClick={() => {
                              navigate('/customer/cart');
                              setShowCartPreview(false);
                            }}
                          >
                            View Cart
                          </button>
                          <button
                            className="flex-1 py-3 rounded-xl font-semibold cursor-pointer transition-all border-2 border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
                            onClick={() => {
                              navigate('/customer/checkout');
                              setShowCartPreview(false);
                            }}
                          >
                            Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-xl cursor-pointer transition-all hover:bg-slate-50 hover:border-slate-300"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-base">
                      <User size={18} />
                    </div>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] z-[1002] border border-slate-200 overflow-hidden animate-slide-down max-sm:w-[280px] max-sm:right-[-20px]">
                      <div className="px-4 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-base">
                            <User size={18} />
                          </div>
                          <div>
                            <h4 className="m-0 mb-1 text-sm text-slate-800 font-semibold">{user?.name || 'Customer'}</h4>
                            <span className="text-xs text-slate-500">{user?.email || 'customer@example.com'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {userMenuItems.map((item, index) => (
                          <button
                            key={index}
                            className="w-full px-4 py-3 border-none bg-none flex items-center gap-3 cursor-pointer text-slate-600 text-sm transition-colors hover:bg-slate-50 hover:text-slate-800"
                            onClick={() => {
                              if (item.label === 'Settings') {
                                navigate('/customer/settings');
                              } else {
                                navigate(item.path);
                              }
                              setShowUserMenu(false);
                            }}
                          >
                            <span className="text-slate-500 w-5">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 py-3 px-4 space-y-2 bg-slate-50">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Theme</p>
                        <div className="grid grid-cols-3 gap-2">
                          {themeOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => setTheme(option.value)}
                              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${theme === option.value ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 py-2">
                        <button
                          className="w-full px-4 py-3 border-none bg-none flex items-center gap-3 cursor-pointer text-red-500 text-sm transition-colors hover:bg-red-50 hover:text-red-600"
                          onClick={onLogout}
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search - Expanded */}
            {isSearchExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 animate-slide-down">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="flex border-2 border-slate-200 rounded-lg overflow-hidden mb-3">
                    <input
                      type="search"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-3 border-none outline-none text-base bg-transparent"
                      autoFocus
                    />
                    <button type="submit" className="px-4 bg-emerald-500 border-none cursor-pointer flex items-center justify-center">
                      <Search size={20} className="text-white" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation - Desktop */}
        <nav className="py-2 bg-white border-b border-slate-100 hidden md:block">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Navigation Links */}
              <nav className="flex gap-1">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 font-medium text-sm transition-all hover:bg-slate-50 hover:text-slate-800 ${location.pathname === link.path ? 'bg-green-50 text-green-700 font-semibold' : ''}`}
                    onClick={() => navigate(link.path)}
                  >
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        <div className={`fixed top-0 left-[-100%] bottom-0 w-[320px] bg-white z-[2000] transition-left duration-300 flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.1)] ${isMobileMenuOpen ? 'left-0' : ''}`}>
          <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="m-0 mb-1 text-base text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis">{user?.name || 'Welcome'}</h3>
                <span className="text-xs text-slate-500 block whitespace-nowrap overflow-hidden text-ellipsis">{user?.email || 'customer@example.com'}</span>
              </div>
            </div>
            <button
              className="bg-none border-none text-xl text-slate-500 cursor-pointer p-2 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="px-4 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
              <MapPin size={18} className="text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-500 block mb-0.5">Delivering to</span>
                <span className="text-sm text-slate-800 font-medium block whitespace-nowrap overflow-hidden text-ellipsis">{deliveryAddress.primary}</span>
              </div>
              <button
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-600 text-xs font-medium cursor-pointer flex-shrink-0 whitespace-nowrap hover:bg-slate-100"
                onClick={() => {
                  navigate('/customer/addresses');
                  setIsMobileMenuOpen(false);
                }}
              >
                Change
              </button>
            </div>

            <div className="py-4">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 text-slate-600 text-sm transition-colors border-l-4 border-transparent hover:bg-slate-50 ${location.pathname === link.path ? 'bg-green-50 text-green-700 font-semibold border-l-green-500' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <ChevronDown size={16} className="text-slate-400 -rotate-90" />
                </Link>
              ))}

              <div className="h-px bg-slate-200 my-3 mx-4"></div>

              {userMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center justify-between px-4 py-3 text-slate-600 text-sm transition-colors border-l-4 border-transparent hover:bg-slate-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    {item.label !== 'Settings' && <span className="text-slate-500">{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown size={16} className="text-slate-400 -rotate-90" />
                </Link>
              ))}
            </div>

            <div className="mt-auto px-4 py-4 border-t border-slate-200">
              <button
                className="w-full px-4 py-3 bg-red-100 border-none border-0 rounded-lg text-red-600 font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors hover:bg-red-200"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} className="text-red-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[1999] animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerHeader;
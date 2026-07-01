import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../../context/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, User, Bell, MapPin, 
  Menu, ChevronDown, Package, Home, Store, 
  History, Settings, LogOut
} from 'lucide-react';
import './Header.scss';

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
    { label: 'My Orders', icon: <Package size={18} />, path: '/customer/orders' },
    { label: 'Address Book', icon: <MapPin size={18} />, path: '/customer/addresses' },
    { label: 'Notifications', icon: <Bell size={18} />, path: '/customer/notifications' },
    { label: 'Settings', icon: null, path: '/customer/settings' },
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="customer-header">
        {/* Top Bar - Desktop & Mobile */}
        <div className="header-top">
          <div className="container">
            <div className="header-main">
              {/* Logo Section */}
              <div className="logo-section">
                <button 
                  className="mobile-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <Menu size={24} />
                </button>
                
                <div className="logo" onClick={() => navigate('/customer/dashboard')}>
                  <span className="logo-icon">🌾</span>
                  <div className="logo-text">
                    <h1 className="logo-title">FarmFresh</h1>
                    <span className="logo-subtitle">Direct from Farm</span>
                  </div>
                </div>
              </div>

              {/* Search Section - Desktop */}
              <div className="search-section desktop-search" ref={searchRef}>
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-wrapper">
                    <input
                      type="search"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      aria-label="Search products"
                    />
                    
                    <button type="submit" className="search-btn" aria-label="Search">
                      <Search size={20} />
                    </button>
                  </div>
                </form>
              </div>

              {/* User Actions */}
              <div className="user-actions">
                {/* Mobile Search Toggle */}
                <button 
                  className="mobile-search-toggle"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  aria-label="Search"
                >
                  <Search size={22} />
                </button>

                {/* Delivery Info - Desktop */}

                {/* Notifications */}
                <div className="notification-wrapper">
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/customer/notifications')}
                    aria-label={`Notifications (${notificationCount})`}
                  >
                    <Bell size={22} />
                    {notificationCount > 0 && (
                      <span className="badge">{notificationCount}</span>
                    )}
                  </button>
                </div>

                {/* Cart */}
                <div className="cart-wrapper" ref={cartRef}>
                  <button 
                    className="action-btn cart-btn"
                    onClick={() => navigate('/customer/cart')}
                    aria-label={`Cart (${cartCount} items)`}
                  >
                    <ShoppingCart size={22} />
                    {cartCount > 0 && (
                      <span className="badge">{cartCount}</span>
                    )}
                    <span className="cart-label">Cart</span>
                  </button>

                  {/* Cart Preview */}
                  {showCartPreview && (
                    <div className="cart-preview">
                      <div className="preview-header">
                        <h3>Your Cart ({cartCount})</h3>
                        <button 
                          className="close-preview"
                          onClick={() => setShowCartPreview(false)}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="cart-items">
                        {cart.length === 0 && <div className="empty-cart">Your cart is empty.</div>}
                        {cart.map(item => (
                          <div key={item._id} className="cart-item">
                            <div className="item-info">
                              <h4 className="item-name">{item.name}</h4>
                              <div className="item-meta">
                                <span className="item-qty">{item.quantity}</span>
                                <span className="item-price">{item.price} ETB</span>
                              </div>
                            </div>
                            <div className="item-total">
                              {item.quantity * item.price} ETB
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="cart-summary">
                        <div className="total-row">
                          <span>Total:</span>
                          <span className="total-amount">{cartTotal.toFixed(2)} ETB</span>
                        </div>
                        <div className="cart-actions">
                          <button 
                            className="btn view-cart"
                            onClick={() => {
                              navigate('/customer/cart');
                              setShowCartPreview(false);
                            }}
                          >
                            View Cart
                          </button>
                          <button 
                            className="btn checkout"
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
                <div className="user-profile-wrapper" ref={userMenuRef}>
                  <button 
                    className="user-profile-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                  >
                    <div className="user-avatar">
                      {user?.name?.charAt(0) || 'C'}
                    </div>
                    <span className="user-name">{user?.name?.split(' ')[0] || 'Guest'}</span>
                    <ChevronDown size={16} className={`chevron ${showUserMenu ? 'up' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <div className="user-details">
                          <div className="dropdown-avatar">
                            {user?.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h4 className="dropdown-name">{user?.name || 'Customer'}</h4>
                            <span className="dropdown-email">{user?.email || 'customer@example.com'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="dropdown-items">
                        {userMenuItems.map((item, index) => (
                          <button
                            key={index}
                            className="dropdown-item"
                            onClick={() => {
                              if (item.label === 'Settings') {
                                navigate('/customer/settings');
                              } else {
                                navigate(item.path);
                              }
                              setShowUserMenu(false);
                            }}
                          >
                            {item.label !== 'Settings' && item.icon}
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="dropdown-footer">
                        <button 
                          className="dropdown-item logout"
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
              <div className="mobile-search-expanded">
                <form onSubmit={handleSearch} className="search-form full-width">
                  <div className="search-wrapper">
                    <input
                      type="search"
                      placeholder="What are you looking for?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                    <button type="submit" className="search-btn">
                      <Search size={20} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation - Desktop */}
        <nav className="main-navigation desktop-only">
          <div className="container">
            <div className="nav-container">
              {/* Navigation Links */}
              <nav className="nav-links">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
                    onClick={() => navigate(link.path)}
                  >
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="nav-promo">
                <span className="promo-text">🚚 Free Delivery | 🎁 10% Off First Order</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-avatar">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="mobile-user-details">
                <h3>{user?.name || 'Welcome'}</h3>
                <span>{user?.email || 'customer@example.com'}</span>
              </div>
            </div>
            <button 
              className="close-mobile-nav"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="mobile-nav-content">
            <div className="mobile-address">
              <MapPin size={18} />
              <div>
                <span className="address-label">Delivering to</span>
                <span className="address-text">{deliveryAddress.primary}</span>
              </div>
              <button 
                className="change-address"
                onClick={() => {
                  navigate('/customer/addresses');
                  setIsMobileMenuOpen(false);
                }}
              >
                Change
              </button>
            </div>

            <div className="mobile-nav-links">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-item ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <ChevronDown size={16} className="arrow" />
                </Link>
              ))}

              <div className="mobile-nav-divider"></div>

              {userMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="mobile-nav-item"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label !== 'Settings' && item.icon}
                  <span>{item.label}</span>
                  <ChevronDown size={16} className="arrow" />
                </Link>
              ))}
            </div>

            <div className="mobile-nav-footer">
              <button 
                className="mobile-logout"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerHeader;
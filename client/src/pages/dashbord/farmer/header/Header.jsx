import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import logo from '../../../../assets/logo.jpg';
import './FarmerHeader.scss';

const FarmerHeader = ({ user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { 
      to: '/farmer/dashboard', 
      label: 'Overview',
      icon: '📊',
      badge: null
    },
    // { 
    //   to: '/farmer/market', 
    //   label: 'Market',
    //   icon: '🛒',
    //   badge: 3
    // },
    // { 
    //   to: '/farmer/orders', 
    //   label: 'Orders',
    //   icon: '📦',
    //   badge: 12
    // },
    // { 
    //   to: '/farmer/inventory', 
    //   label: 'Inventory',
    //   icon: '📋'
    // },
    // { 
    //   to: '/farmer/analytics', 
    //   label: 'Analytics',
    //   icon: '📈'
    // },
    { 
      to: '/farmer/settings', 
      label: 'Settings',
      icon: '⚙️'
    }
  ];

  const handleProfileClick = () => {
    navigate('/farmer/profile');
  };

  const handleNotificationClick = () => {
    navigate('/farmer/notifications');
  };

  return (
    <header className="farmer-header" role="banner">
      {/* Top Bar */}
      <div className="header-top-bar">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-icon flex items-center justify-center overflow-hidden">
              <img src={logo} alt="FarmConnect" className="h-full w-full object-cover" />
            </div>
            <div className="logo-text">
              <h1 className="logo-title">FarmConnect</h1>
              <span className="logo-subtitle">Farmer Dashboard</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="search"
              placeholder="Search products, orders, analytics..."
              className="search-input"
              aria-label="Search dashboard"
            />
            <button className="search-button" aria-label="Search">
              🔍
            </button>
          </div>
        </div>

        <div className="header-right">
          {/* Notifications */}
         

          {/* User Profile */}
          <div className="user-profile-dropdown">
            <button 
              className="user-profile-button"
              onClick={handleProfileClick}
              aria-expanded="false"
              aria-haspopup="true"
            >
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'F'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Farmer'}</span>
                <span className="user-role">{user?.farmName || 'Farm Owner'}</span>
              </div>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            <div className="dropdown-menu" role="menu">
              <button 
                className="dropdown-item"
                onClick={() => navigate('/farmer/profile')}
              >
                <span className="item-icon">👤</span>
                My Profile
              </button>
              <button 
                className="dropdown-item"
                onClick={() => navigate('/farmer/settings')}
              >
                <span className="item-icon">⚙️</span>
                Account Settings
              </button>
              <button 
                className="dropdown-item"
                onClick={() => navigate('/farmer/help')}
              >
                <span className="item-icon">❓</span>
                Help & Support
              </button>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item logout-item"
                onClick={onLogout}
              >
                <span className="item-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="header-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-search-container">
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nav-search-input"
            aria-label="Search navigation"
          />
        </div>
        <div className="nav-container">
          <ul className="nav-list">
            {navLinks.map(link => {
              const isActive = location.pathname.startsWith(link.to);
              return (
                <li key={link.to} className="nav-item">
                  <Link
                    to={link.to}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="nav-icon" role="img" aria-hidden="true">
                      {link.icon}
                    </span>
                    <span className="nav-label">{link.label}</span>
                    {link.badge && (
                      <span className="nav-badge" aria-label={`${link.badge} notifications`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          {/* Quick Actions */}
          <div className="quick-actions">
            <Link 
              to="/farmer/products/add"
              className="action-button primary-action"
              style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <span className="action-icon">➕</span>
              Add Product
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="breadcrumb-container">
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumb">
            <li>
              <Link to="/farmer/dashboard">Dashboard</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">
              {navLinks.find(link => location.pathname.startsWith(link.to))?.label || 'Current Page'}
            </li>
          </ol>
        </nav>
        <div className="current-time">
          <span className="time-icon">🕐</span>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </header>
  );
};

export default FarmerHeader;
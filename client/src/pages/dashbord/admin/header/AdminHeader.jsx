import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  BarChart2,
  Package,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import './AdminHeader.scss';

const AdminHeader = ({ 
  userCount = 0,
  farmerCount = 0,
  onNav,
  onLogout,
  activeTab = 'dashboard',
  showNotifications = false,
  notificationCount = 0,
  onToggleSidebar,
  isSidebarOpen = true
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [navSearchTerm, setNavSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 />, count: null },
    { id: 'users', label: 'Users', icon: <Users />, count: userCount },
    { id: 'farmers', label: 'Farmers', icon: <User />, count: farmerCount },
  ];

  const mobileNavItems = navItems.slice(0, 4);
  const mobileMoreItems = navItems.slice(4);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNav = (id) => {
    onNav(id);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className={`admin-header ${isScrolled ? 'scrolled' : ''}`}>
        {/* Top Bar */}
        <div className="admin-header__top">
          <div className="header-left">
            {/* Removed sidebar-toggle (3 horizontal lines) button as requested */}
            <div className="header-logo">
              <div className="logo-icon">🌱</div>
              <div className="logo-text">
                <h1 className="logo-title">FarmConnect</h1>
                <p className="logo-subtitle">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="header-center">
            <div className="search-container">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search users, orders..." 
                className="search-input"
              />
              <div className="search-shortcut">⌘K</div>
            </div>
          </div>

          <div className="header-right">
            {/* Mobile Search Toggle */}
            <button 
              className="mobile-search-toggle" 
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              <Search />
            </button>

            <button className="header-btn notification-btn">
              <Bell />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            
            {/* Desktop Profile */}
            <div className="profile-container">
              <button className="header-btn profile-btn">
                <div className="profile-avatar">
                  <span>A</span>
                </div>
                <div className="profile-info">
                  <span className="profile-name">Admin User</span>
                  <span className="profile-role">Super Admin</span>
                </div>
                <ChevronDown className="profile-arrow" />
              </button>
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={() => handleMobileNav('profile')}>
                  <User />
                  <span>My Profile</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={onLogout}>
                  <LogOut />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="mobile-search-container">
            <div className="mobile-search-input-container">
              <Search className="mobile-search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="mobile-search-input"
                autoFocus
              />
              <button 
                className="mobile-search-close"
                onClick={() => setShowSearch(false)}
              >
                <X />
              </button>
            </div>
          </div>
        )}

        {/* Stats & Navigation (Desktop) */}
        <div className="admin-header__bottom">
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon users">
                <Users />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Users</h3>
                <p className="stat-value">{userCount.toLocaleString()}</p>
                <span className="stat-change positive">+12% this month</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon farmers">
                <User />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Active Farmers</h3>
                <p className="stat-value">{farmerCount.toLocaleString()}</p>
                <span className="stat-change positive">+8% this month</span>
              </div>
            </div>

            {/* Products stat card removed */}
          </div>

          <nav className="header-navigation">
            <div className="nav-search-container">
              <input
                type="search"
                placeholder="Search..."
                value={navSearchTerm}
                onChange={(e) => setNavSearchTerm(e.target.value)}
                className="nav-search-input"
                aria-label="Search navigation"
              />
            </div>
            <div className="nav-scroll-container">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => onNav(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className="nav-badge">{item.count}</span>
                  )}
                  {activeTab === item.id && <div className="active-indicator"></div>}
                </button>
              ))}
            </div>
            
            <div className="quick-actions">
              <button className="quick-action-btn">
                <UserCheck />
                <span>Verify Farmers</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${showMobileMenu ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-profile">
            <div className="mobile-avatar">A</div>
            <div className="mobile-profile-info">
              <h3>Admin User</h3>
              <p>Super Admin</p>
            </div>
          </div>
          <button 
            className="mobile-nav-close"
            onClick={() => setShowMobileMenu(false)}
          >
            <X />
          </button>
        </div>

        <div className="mobile-nav-content">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMobileNav(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="mobile-nav-badge">{item.count}</span>
              )}
            </button>
          ))}

          <div className="mobile-nav-divider"></div>

          <button className="mobile-nav-item" onClick={onLogout}>
            <LogOut />
            <span>Logout</span>
          </button>
        </div>

        <div className="mobile-nav-footer">
          <p className="version">v2.1.0</p>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {mobileNavItems.map(item => (
          <button
            key={item.id}
            className={`mobile-bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <span className="mobile-bottom-nav-icon">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
            {item.count !== null && item.count > 0 && (
              <span className="mobile-bottom-nav-badge">{item.count}</span>
            )}
          </button>
        ))}
        
        {mobileMoreItems.length > 0 && (
          <button 
            className="mobile-bottom-nav-item more"
            onClick={() => setShowMobileMenu(true)}
          >
            <span className="mobile-bottom-nav-icon">
              <Menu />
            </span>
            <span className="mobile-bottom-nav-label">More</span>
          </button>
        )}
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div 
          className="mobile-search-overlay"
          onClick={() => setShowSearch(false)}
        />
      )}
    </>
  );
};

export default AdminHeader;
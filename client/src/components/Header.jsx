import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { customerAPI } from '../api';
import logo from '../assets/logo.jpg';
import {
  Search, Heart, Star, ShoppingCart, User, Sun, Moon, Menu, X, Package, Settings, LogOut, Sparkles, ChevronRight
} from 'lucide-react';

const Header = ({ pageType = 'home' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileLoadingRef = useRef(false);
  const dropdownRef = useRef(null);

  const isSpecialPage = pageType === 'login' || pageType === 'register';
  const isFavoritePage = pageType === 'favorite';
  const isCartPage = pageType === 'cart';
  const isCheckoutPage = pageType === 'checkout';
  const isHomePage = pageType === 'home';
  const isDarkMode = resolvedTheme === 'dark';

  useEffect(() => {
    // Only track scroll for pages that need scroll-based style changes
    // Checkout page stays fixed but doesn't change styles on scroll
    if (!isCheckoutPage) {
      const handleScroll = () => setScrolled(window.scrollY > 8);
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isCheckoutPage]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/market?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const profileName = customerProfile?.name || user?.name || 'Customer';
  const avatarUrl = customerProfile?.profileImage || user?.profileImage || '';
  const profileInitials = profileName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    let isMounted = true;

    const loadCustomerProfile = async () => {
      if (!user || profileLoadingRef.current) return;
      profileLoadingRef.current = true;
      setProfileLoading(true);
      
      try {
        const response = await customerAPI.getProfile();
        if (isMounted) setCustomerProfile(response.data || null);
      } catch {
        if (isMounted) setCustomerProfile(null);
      } finally {
        if (isMounted) {
          profileLoadingRef.current = false;
          setProfileLoading(false);
        }
      }
    };

    loadCustomerProfile();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerPositionClass = (isHomePage || isCheckoutPage) ? 'fixed top-0 left-0 right-0' : 'sticky top-0';
  const isOverlay = isHomePage && !scrolled;

  const logoTextClass = useMemo(() => {
    return 'text-emerald-600';
  }, []);

  const logoSubtextClass = useMemo(() => {
    if (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) {
      return scrolled ? 'text-slate-600' : isDarkMode ? 'text-slate-300' : 'text-slate-600';
    }

    return isOverlay ? 'text-white/80' : 'text-slate-500 dark:text-slate-400';
  }, [isDarkMode, isOverlay, isFavoritePage, isSpecialPage, scrolled]);

  const iconButtonClass = useMemo(() => {
    if (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) {
      return scrolled ? 'text-slate-700 hover:bg-slate-100' : isDarkMode ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100';
    }

    return isOverlay
      ? 'text-white hover:bg-white/10'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';
  }, [isDarkMode, isOverlay, isFavoritePage, isSpecialPage, scrolled]);

  const signInButtonClass = useMemo(() => {
    if (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) {
      return scrolled
        ? (isDarkMode ? 'border-slate-600 bg-slate-800 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-900 shadow-sm')
        : isDarkMode
          ? 'border-white/20 bg-white/10 text-white backdrop-blur-sm'
          : isCheckoutPage
            ? 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 backdrop-blur-sm'
            : 'border-slate-200/80 bg-white/70 text-slate-900 backdrop-blur-sm';
    }

    return isOverlay
      ? 'border-white/20 bg-white/10 text-white backdrop-blur-sm'
      : 'border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
  }, [isDarkMode, isOverlay, isFavoritePage, isSpecialPage, scrolled]);

  const searchBarClass = useMemo(() => {
    if (!isSpecialPage && !isFavoritePage && !isCartPage && !isCheckoutPage) {
      return isOverlay
        ? 'border-white/30 bg-white/15 backdrop-blur-md'
        : 'border-slate-200 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/90';
    }

    return scrolled
      ? 'border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]'
      : isDarkMode
        ? 'border-white/15 bg-slate-900/35 shadow-[0_10px_35px_rgba(2,6,23,0.22)]'
        : 'border-slate-200/80 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)]';
  }, [isDarkMode, isOverlay, isFavoritePage, isSpecialPage, scrolled]);

  const searchBarFocusClass = isSearchFocused && (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-white' : '';
  const searchIconClass = isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage
    ? scrolled ? 'text-slate-500' : isDarkMode ? 'text-slate-300' : 'text-slate-500'
    : isOverlay ? 'text-white/80' : 'text-slate-500 dark:text-slate-400';
  const searchInputClass = isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage
    ? scrolled
      ? 'text-slate-900 placeholder:text-slate-400'
      : isDarkMode
        ? 'text-white placeholder:text-slate-300/80'
        : 'text-slate-900 placeholder:text-slate-500'
    : isOverlay
      ? 'text-white placeholder:text-white/70'
      : 'text-slate-900 placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400';

  return (
    <header
      className={`${headerPositionClass} z-50 border-b transition-all duration-500 ${isCheckoutPage
        ? 'border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
        : isSpecialPage || isFavoritePage || isCartPage
          ? scrolled
            ? 'border-slate-200/80 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] dark:bg-slate-900 dark:border-slate-700'
            : 'border-transparent shadow-none'
          : isOverlay
            ? 'border-transparent shadow-none'
            : 'border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
        }`}
    >
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--card)] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profileName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{profileInitials}</span>
                  )}
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)]">
                  <User className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
              )}
              <div>
                {user ? (
                  <>
                    <p className="text-sm font-bold text-[var(--foreground)]">{user.name || user.email}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{user.role}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-[var(--foreground)]">Guest User</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center hover:bg-[var(--secondary)] rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/customer/profile"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/customer/profile' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profile
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/customer/orders"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname.startsWith('/customer/orders') ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  My Orders
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/favorites"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/favorites' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Favorites
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/customer/dashboard/reviews"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname.startsWith('/customer/dashboard/reviews') ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="h-5 w-5" />
                  My Reviews
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/customer/settings"
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/customer/settings' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Sign In
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Sign Up
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Favorites
                  <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                </Link>
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--muted-foreground)] text-center">
              © 2026 FarmConnect. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          <div className="flex items-center gap-3">
            {/* Hamburger - mobile only, far left */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex md:hidden h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${iconButtonClass}`}
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-emerald-200 transition-transform hover:rotate-6">
                <img src={logo} alt="FarmConnect" className="h-full w-full object-cover" />
              </div>
              {/* Text hidden on mobile, visible on desktop */}
              <div className="hidden md:flex flex-col">
                <span className={`text-lg font-black leading-none tracking-tight ${logoTextClass}`}>FarmConnect</span>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${logoSubtextClass}`}>DIRECT FROM SOIL</span>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 max-w-md sm:max-w-lg lg:max-w-xl sm:flex justify-center">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex w-full items-center overflow-hidden rounded-full transition-all duration-300 backdrop-blur-xl ${searchBarClass} ${searchBarFocusClass}`}
            >
              <Search className={`ml-3 h-4 w-4 flex-shrink-0 transition-colors ${searchIconClass}`} />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`flex-1 bg-transparent px-3 py-2 text-sm font-medium focus:outline-none transition-colors ${searchInputClass}`}
              />
              <button type="submit" className="p-1.5 bg-emerald-600 hover:bg-emerald-700 transition-colors mr-1.5 my-1.5 rounded-full shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${iconButtonClass}`}
              aria-label="Toggle theme"
              type="button"
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>

            {/* Favorites */}
            <Link
              to="/favorites"
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl relative transition-all duration-300 ${iconButtonClass}`}
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${isOverlay ? 'text-white hover:text-emerald-300' : 'text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {user ? (
              <div className="relative hidden sm:inline-block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`}
                  aria-label="Profile"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={profileName} className="h-full w-full object-cover" />
                    ) : (
                      <span>{profileInitials}</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{profileName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <nav className="py-1">
                      <Link
                        to="/customer/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/customer/orders"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        to="/customer/dashboard/reviews"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Star className="h-4 w-4" />
                        My Reviews
                      </Link>
                      <Link
                        to="/customer/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </nav>

                    {/* Logout */}
                    <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${signInButtonClass}`}
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/customer/cart"
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold transition-all relative bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black rounded-full min-w-5 h-5 flex items-center justify-center px-1 border border-emerald-600">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { customerAPI } from '../api';
import {
  BarChart3,
  ChevronDown,
  Heart,
  Leaf,
  Monitor,
  Moon,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  User,
  Menu,
  Settings,
  LogOut,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const Header = ({ pageType = 'home' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);

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

  const handleThemeChange = (newTheme) => setTheme(newTheme);

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
    navigate('/login');
  };

  useEffect(() => {
    let isMounted = true;

    const loadCustomerProfile = async () => {
      if (!user) return;
      try {
        const response = await customerAPI.getProfile();
        if (isMounted) {
          setCustomerProfile(response.data || null);
        }
      } catch (error) {
        if (isMounted) {
          setCustomerProfile(null);
        }
      }
    };

    loadCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const headerPositionClass = (isHomePage || isCheckoutPage) ? 'fixed top-0 left-0 right-0' : 'sticky top-0';
  const isOverlay = isHomePage && !scrolled;

  const logoTextClass = useMemo(() => {
    if (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) {
      return scrolled ? 'text-emerald-600' : isDarkMode ? 'text-white' : 'text-emerald-600';
    }

    return isOverlay ? 'text-white' : 'text-emerald-600 dark:text-white';
  }, [isDarkMode, isOverlay, isFavoritePage, isSpecialPage, scrolled, isCartPage, isCheckoutPage]);

  const logoSubtextClass = useMemo(() => {
    if (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) {
      return scrolled ? 'text-slate-600' : isDarkMode ? 'text-slate-300' : 'text-slate-600';
    }

    return isOverlay ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400';
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
        ? 'border-slate-200 bg-white text-slate-900 shadow-sm'
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

  const searchBarFocusClass = isSearchFocused && (isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage) ? 'border-[#00a86b] ring-2 ring-[#00a86b]/20 bg-white' : '';
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
            ? 'border-slate-200/80 shadow-[0_10px_25px_rgba(15,23,42,0.08)]'
            : 'border-transparent shadow-none'
          : isOverlay
            ? 'border-transparent shadow-none'
            : 'border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'
        }`}
      style={
        isCheckoutPage
          ? { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', backdropFilter: 'blur(16px)' }
          : isSpecialPage || isFavoritePage || isCartPage
            ? { backgroundColor: scrolled ? '#ffffff' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)' }
            : undefined
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          <div className="flex items-center">
            {/* Mobile Hamburger Menu - Forced to Far Left with order-first */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`order-first mr-4 flex md:hidden h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${iconButtonClass}`}
              aria-label="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex flex-shrink-0 items-center gap-2 order-2 md:order-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-200 transition-transform hover:rotate-6">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg font-black leading-none tracking-tight ${logoTextClass}`}>FarmConnect</span>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${logoSubtextClass}`}>Direct from soil</span>
              </div>
            </Link>
          </div>

          {isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage ? (
            <div className="hidden flex-1 max-w-xl sm:flex">
              <form
                onSubmit={handleSearchSubmit}
                className={`flex w-full items-center overflow-hidden rounded-full border px-2 py-1.5 backdrop-blur-xl transition-all duration-300 ${searchBarClass} ${searchBarFocusClass}`}
              >
                <Search className={`ml-3 h-4 w-4 flex-shrink-0 transition-colors ${searchIconClass}`} />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none transition-colors ${searchInputClass}`}
                />
                <button type="submit" className="mr-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#00a86b] text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:scale-105 hover:bg-[#00945e]">
                  <Sparkles className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden flex-1 max-w-md px-4 md:flex">
              <div className={`flex w-full items-center overflow-hidden rounded-full border px-2 py-1.5 transition-all duration-300 ${searchBarClass}`}>
                <Search className={`ml-3 h-4 w-4 flex-shrink-0 transition-colors ${searchIconClass}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className={`flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none transition-colors ${searchInputClass}`}
                />
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-shrink-0 items-center gap-2.5 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-95 ${iconButtonClass}`} aria-label="Toggle Theme">
                  {isDarkMode ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer">
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer">
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer">
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/favorites" className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${iconButtonClass}`}>
              <Heart className={`h-4.5 w-4.5 transition-colors ${isSpecialPage || isFavoritePage || isCartPage || isCheckoutPage ? (scrolled ? 'text-slate-700 hover:text-rose-500' : isDarkMode ? 'text-white hover:text-rose-400' : 'text-slate-700 hover:text-rose-500') : isOverlay ? 'text-white hover:text-rose-300' : 'text-slate-700 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400'}`} />
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold transition-all duration-300 hover:opacity-90 ${signInButtonClass}`} type="button">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={profileName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 border border-slate-200 bg-white p-2 shadow-lg text-left">
                  <div className="mb-2 rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={profileName} className="h-full w-full object-cover" />
                        ) : (
                          <span>{profileInitials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{profileName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem onClick={() => navigate('/customer/profile')} className="flex items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-emerald-50 hover:text-slate-900">
                    <User className="h-4 w-4 text-emerald-600" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/orders')} className="flex items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-emerald-50 hover:text-slate-900">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/dashboard/reviews')} className="flex items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-emerald-50 hover:text-slate-900">
                    <Star className="h-4 w-4 text-emerald-600" />
                    My Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/customer/settings')} className="flex items-center gap-2 rounded-xl px-2 py-2 text-slate-700 hover:bg-emerald-50 hover:text-slate-900">
                    <Settings className="h-4 w-4 text-emerald-600" />
                    Settings
                  </DropdownMenuItem>
                  <div className="my-1 h-px bg-slate-200" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 rounded-xl px-2 py-2 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300 hover:opacity-90 sm:inline-flex ${signInButtonClass}`}>
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}

            <Link to="/customer/cart" className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${isCartPage || isCheckoutPage ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700' : 'bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-600'}`}>
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
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

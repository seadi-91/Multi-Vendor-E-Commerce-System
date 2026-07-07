import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Package, ChevronLeft, BadgeCheck, Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ cartCount, favoritesCount, isOpen, onClose }) => {
  const baseMenuClass = "group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-[var(--sidebar-foreground)] font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sidebar-primary)]/20 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-primary)]";
  const activeMenuClass = "group flex items-center justify-between rounded-2xl border border-[var(--sidebar-primary)]/20 bg-[var(--sidebar-accent)] px-4 py-3 font-medium text-[var(--sidebar-primary)] shadow-[0_10px_25px_-12px_rgba(5,150,105,0.45)]";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 rounded-r-[32px] border border-[var(--sidebar-border)] bg-[linear-gradient(180deg,var(--sidebar)_0%,var(--sidebar-accent)_100%)] p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out h-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand Logo */}
          <div className="mb-6 rounded-[24px] border border-[var(--border)] bg-[var(--card)]/80 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-md">
                  <span className="text-xl text-[var(--primary-foreground)]">🌾</span>
                </div>
                <h1 className="flex items-center text-lg font-extrabold">
                  <span className="text-[var(--primary)]">Farm</span>
                  <span className="text-[var(--foreground)]">Connect</span>
                </h1>
              </Link>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] lg:hidden"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-[var(--secondary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
              Fresh from Farm to You
            </div>
          </div>

          {/* Core Shopping Sidebar Links */}
          <nav className="space-y-2">
            <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🏠</span> <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/market" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🥗</span> <span>Products</span>
              </div>
            </NavLink>

            <NavLink to="/customer/dashboard/orders" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛍️</span> <span>My Orders</span>
              </div>
            </NavLink>

            <NavLink to="/favorites" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🤍</span> <span>Wishlist</span>
              </div>
              {favoritesCount > 0 && (
                <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              )}
            </NavLink>

            <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span> <span>Cart</span>
              </div>
              <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-0.5 rounded-full font-bold">{cartCount || 0}</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Promo Card */}
        <div className="relative mt-6 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--primary)/15,var(--secondary))] p-4 shadow-inner">
          <div className="relative z-10">
            <div className="mb-2 inline-flex rounded-full bg-[var(--card)]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              Fresh Deals
            </div>
            <h3 className="mb-1 text-base font-bold text-[var(--foreground)]">Save more on seasonal picks</h3>
            <p className="mb-3 max-w-[140px] text-xs text-[var(--muted-foreground)]">Enjoy handpicked farm favorites at special prices.</p>
            <Link to="/" className="inline-flex rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--ring)]">
              Shop Now
            </Link>
          </div>
          <span className="pointer-events-none absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 transition-transform group-hover:scale-110">🧺</span>
        </div>
      </aside>
    </>
  );
};

// ─── Cart Dashboard Header (Custom for Cart Page) ─────────────────────────────
const CartDashboardHeader = ({ user, cartCount, onLogout, onMenuToggle, favoritesCount, theme, setTheme }) => {
  const navigate = useNavigate();
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 text-[var(--foreground)] sm:px-8">
      {/* Left: Mobile Menu Toggle + Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 text-[var(--foreground)] hover:text-[var(--primary)] lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--primary)]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Global Action Icons */}
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <div onClick={() => navigate('/favorites')} className="relative cursor-pointer p-1 text-[var(--foreground)] hover:text-[var(--primary)]">
          <span className="text-xl">🤍</span>
          {favoritesCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-white">{favoritesCount}</span>
          )}
        </div>
        <Link to="/customer/cart" className="relative cursor-pointer p-1 text-[var(--foreground)] hover:text-[var(--primary)]">
          <span className="text-xl">🛒</span>
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-[var(--primary-foreground)]">{cartCount || 0}</span>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="rounded-full border border-[var(--border)] bg-[var(--secondary)] p-1 shadow-sm"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'}
              alt="User profile"
              className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-xl">
              <button onClick={() => { setMenuOpen(false); navigate('/customer/dashboard'); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
                Profile
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/customer/dashboard/orders'); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
                My Orders
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/customer/dashboard/reviews'); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
                My Reviews
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/customer/dashboard/settings'); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]">
                Settings
              </button>
              <div className="my-1 h-px bg-[var(--border)]" />
              <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--destructive)] hover:bg-[var(--destructive)/10]">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── Cart Public Header (Custom for Cart Page) ───────────────────────────────
const CartPublicHeader = ({ cartCount, theme, setTheme }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-[var(--card)] text-[var(--foreground)] sticky top-0 z-50 shadow-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Logo — left */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">FC</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-600 tracking-tight">FarmConnect</span>
        </Link>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--primary)]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <Link
            to="/favorites"
            className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)] relative"
          >
            <Heart className="w-5 h-5" />
          </Link>
          <Link
            to="/customer/cart"
            className="flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--primary)] relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle = ({ theme, setTheme }) => {
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const renderThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-4.5 h-4.5" />;
    return isDark ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] hover:bg-[var(--primary)]/25 transition-all" aria-label="Toggle Theme">
          {renderThemeIcon()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)] px-3 py-2">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)] px-3 py-2">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)] px-3 py-2">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Cart = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    const applyThemeStyles = currentTheme => {
      root.classList.remove('light', 'dark');
      if (currentTheme === 'dark') {
        root.style.setProperty('--background', 'oklch(0.25 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--card', 'oklch(0.30 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--popover', 'oklch(0.30 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.35 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--muted', 'oklch(0.35 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.8 0 0)');
        root.style.setProperty('--accent', 'oklch(0.35 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
        root.style.setProperty('--border', 'oklch(1 0 0 / 20%)');
        root.style.setProperty('--input', 'oklch(1 0 0 / 25%)');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', 'oklch(0.30 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.35 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 20%)');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else if (currentTheme === 'light') {
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#000000');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--card-foreground', '#000000');
        root.style.setProperty('--popover', '#ffffff');
        root.style.setProperty('--popover-foreground', '#000000');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', '#f3f4f6');
        root.style.setProperty('--secondary-foreground', '#000000');
        root.style.setProperty('--muted', '#f3f4f6');
        root.style.setProperty('--muted-foreground', '#6b7280');
        root.style.setProperty('--accent', '#f3f4f6');
        root.style.setProperty('--accent-foreground', '#000000');
        root.style.setProperty('--destructive', '#dc2626');
        root.style.setProperty('--border', '#e5e7eb');
        root.style.setProperty('--input', '#e5e7eb');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', '#ffffff');
        root.style.setProperty('--sidebar-foreground', '#000000');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', '#f3f4f6');
        root.style.setProperty('--sidebar-accent-foreground', '#000000');
        root.style.setProperty('--sidebar-border', '#e5e7eb');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') {
          root.style.setProperty('--background', 'oklch(0.145 0 0)');
          root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--card', 'oklch(0.205 0 0)');
          root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--popover', 'oklch(0.205 0 0)');
          root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--primary', '#059669');
          root.style.setProperty('--primary-foreground', '#ffffff');
          root.style.setProperty('--secondary', 'oklch(0.269 0 0)');
          root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--muted', 'oklch(0.269 0 0)');
          root.style.setProperty('--muted-foreground', 'oklch(0.708 0 0)');
          root.style.setProperty('--accent', 'oklch(0.269 0 0)');
          root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
          root.style.setProperty('--border', 'oklch(1 0 0 / 10%)');
          root.style.setProperty('--input', 'oklch(1 0 0 / 15%)');
          root.style.setProperty('--ring', '#059669');
          root.style.setProperty('--sidebar', 'oklch(0.205 0 0)');
          root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--sidebar-primary', '#059669');
          root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
          root.style.setProperty('--sidebar-accent', 'oklch(0.269 0 0)');
          root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
          root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 10%)');
          root.style.setProperty('--sidebar-ring', '#059669');
        } else {
          root.style.setProperty('--background', 'oklch(1 0 0)');
          root.style.setProperty('--foreground', 'oklch(0.145 0 0)');
          root.style.setProperty('--card', 'oklch(1 0 0)');
          root.style.setProperty('--card-foreground', 'oklch(0.145 0 0)');
          root.style.setProperty('--popover', 'oklch(1 0 0)');
          root.style.setProperty('--popover-foreground', 'oklch(0.145 0 0)');
          root.style.setProperty('--primary', '#059669');
          root.style.setProperty('--primary-foreground', '#ffffff');
          root.style.setProperty('--secondary', 'oklch(0.97 0 0)');
          root.style.setProperty('--secondary-foreground', 'oklch(0.205 0 0)');
          root.style.setProperty('--muted', 'oklch(0.97 0 0)');
          root.style.setProperty('--muted-foreground', 'oklch(0.556 0 0)');
          root.style.setProperty('--accent', 'oklch(0.97 0 0)');
          root.style.setProperty('--accent-foreground', 'oklch(0.205 0 0)');
          root.style.setProperty('--destructive', 'oklch(0.577 0.245 27.325)');
          root.style.setProperty('--border', 'oklch(0.922 0 0)');
          root.style.setProperty('--input', 'oklch(0.922 0 0)');
          root.style.setProperty('--ring', '#059669');
          root.style.setProperty('--sidebar', 'oklch(0.985 0 0)');
          root.style.setProperty('--sidebar-foreground', 'oklch(0.145 0 0)');
          root.style.setProperty('--sidebar-primary', '#059669');
          root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
          root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
          root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.205 0 0)');
          root.style.setProperty('--sidebar-border', 'oklch(0.922 0 0)');
          root.style.setProperty('--sidebar-ring', '#059669');
        }
      }
    };

    applyThemeStyles(theme);
    localStorage.setItem('theme', theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => applyThemeStyles('system');
    mediaQuery.addEventListener?.('change', handleSystemChange);
    return () => mediaQuery.removeEventListener?.('change', handleSystemChange);
  }, [theme]);

  const { cart, removeFromCart, cartCount, incrementQuantity, decrementQuantity, clearCart } = useCart();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-xl font-semibold text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = JSON.parse(localStorage.getItem('favorites') || '[]').length;

  const handleCheckout = () => {
    if (loading) {
      // Optionally show a spinner or prevent action until auth state is resolved
      return;
    }
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/customer/checkout' } });
      return;
    }
    navigate('/customer/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <CartPublicHeader cartCount={cartCount} theme={theme} setTheme={setTheme} />
        <div className="max-w-4xl mx-auto bg-[var(--card)]/95 rounded-3xl border border-[var(--border)] p-4 md:p-6 text-[var(--foreground)] mt-2.5 md:mt-5 mb-2.5 md:mb-5 mx-2.5 md:mx-auto">
          <div className="mb-6 border-b border-[var(--border)] pb-3 text-center">
            <h1 className="mb-1 text-xl font-extrabold text-[var(--foreground)] md:text-2xl">Your Shopping Cart</h1>
            {cart.length > 0 && (
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-[var(--foreground)]">
              <div className="inline-flex items-center justify-center mx-auto mb-4 h-20 w-20 rounded-3xl bg-[var(--secondary)] text-[var(--primary)]">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-[var(--foreground)]">Your cart is empty</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Add some delicious items to get started!</p>
              <button
                className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-lg text-sm font-semibold"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div className="flex flex-col gap-4">
                {cart.map(item => (
                  <div
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 p-4 bg-[var(--card)] rounded-3xl border border-[var(--border)] relative"
                    key={item._id}
                  >
                    <div className="w-16 h-16 md:w-16 md:h-16 rounded-3xl overflow-hidden bg-[var(--secondary)]/80 flex-shrink-0 mx-auto md:mx-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-[var(--secondary)] text-[var(--primary)]">
                          🍕
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 mb-1">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">{item.name}</h3>
                        <span className="bg-[var(--secondary)] text-[var(--primary)] px-2 py-0.5 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[var(--muted-foreground)] mb-2 text-xs">
                        {item.description || 'Delicious item waiting for you!'}
                      </p>

                      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2 bg-[var(--secondary)] rounded-full px-1.5 py-0.5">
                          <button
                            className="w-6 h-6 rounded-full bg-[var(--card)] text-[var(--foreground)] text-sm cursor-pointer flex items-center justify-center disabled:opacity-50"
                            onClick={() => decrementQuantity(item._id)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-[var(--foreground)] min-w-[24px] text-center text-sm">{item.quantity}</span>
                          <button
                            className="w-6 h-6 rounded-full bg-[var(--card)] text-[var(--foreground)] text-sm cursor-pointer flex items-center justify-center disabled:opacity-50"
                            onClick={() => incrementQuantity(item._id, item.stock || 99)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                          <span className="text-xs text-[var(--muted-foreground)]">{item.price} ETB</span>
                          <span className="text-sm font-extrabold text-[var(--foreground)]">{item.price * item.quantity} ETB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="bg-transparent text-[var(--destructive)] border-none w-7 h-7 rounded-full text-lg cursor-pointer flex items-center justify-center absolute top-2 right-2 md:static"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="sticky top-5">
                <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-5 text-[var(--foreground)]">
                  <h3 className="mb-4 border-b border-[var(--border)] pb-2 text-base font-extrabold text-[var(--foreground)]">Order Summary</h3>

                  <div className="flex justify-between mb-3 text-[var(--foreground)]">
                    <span className="text-xs text-[var(--muted-foreground)]">Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-[var(--foreground)] text-sm">{total} ETB</span>
                  </div>

                  <div className="flex justify-between mb-3 text-[var(--foreground)]">
                    <span className="text-xs text-[var(--muted-foreground)]">Delivery Fee</span>
                    <span className="font-semibold text-[var(--foreground)] text-sm">50 ETB</span>
                  </div>

                  <div className="flex justify-between mb-3 text-[var(--foreground)]">
                    <span className="text-xs text-[var(--muted-foreground)]">Tax</span>
                    <span className="font-semibold text-[var(--foreground)] text-sm">{(total * 0.15).toFixed(2)} ETB</span>
                  </div>
                  <div className="h-px bg-[var(--border)] my-3"></div>

                  <div className="flex justify-between items-center my-4">
                    <span className="text-sm font-bold text-[var(--foreground)]">Total</span>
                    <span className="text-xl font-black text-[var(--primary)]">
                      {(total + 50 + total * 0.15).toFixed(2)} ETB
                    </span>
                  </div>
                  <button
                    className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 rounded-lg text-sm font-bold mb-3"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    className="w-full bg-transparent text-[var(--destructive)] border border-[var(--destructive)] py-2 rounded-lg text-xs font-semibold"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <CartDashboardHeader
        user={user}
        cartCount={cartCount}
        onLogout={logout}
        onMenuToggle={() => setSidebarOpen(true)}
        favoritesCount={favoritesCount}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="flex-1 overflow-y-auto">
        <section className="px-6 py-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-[var(--foreground)] md:p-6">
            <div className="mb-6 border-b border-[var(--border)] pb-3 text-center">
              <h1 className="mb-1 text-xl font-extrabold text-[var(--foreground)] md:text-2xl">Your Shopping Cart</h1>
              {cart.length > 0 && (
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
                </p>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[var(--foreground)]">
                <div className="mb-4 text-4xl opacity-50">🛒</div>
                <h2 className="mb-2 text-xl font-bold text-[var(--foreground)]">Your cart is empty</h2>
                <p className="mb-6 text-sm text-[var(--muted-foreground)]">Add some delicious items to get started!</p>
                <button
                  className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-[var(--primary-foreground)]"
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
                <div className="flex flex-col gap-4">
                  {cart.map(item => (
                    <div
                      className="relative grid grid-cols-[auto_1fr_auto] gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-[auto_1fr_auto]"
                      key={item._id}
                    >
                      <div className="mx-auto h-16 w-16 flex-shrink-0 overflow-hidden rounded-3xl bg-[var(--secondary)] md:h-16 md:w-16">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--secondary)] text-3xl text-[var(--primary)]">
                            🍕
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col text-center md:text-left">
                        <div className="mb-1 flex flex-col items-center gap-1 md:flex-row md:items-start md:gap-3">
                          <h3 className="text-sm font-bold text-[var(--foreground)]">{item.name}</h3>
                          <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                            {item.category}
                          </span>
                        </div>
                        <p className="mb-2 text-xs text-[var(--muted-foreground)]">
                          {item.description || 'Delicious item waiting for you!'}
                        </p>

                        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
                          <div className="flex items-center gap-2 rounded-full bg-[var(--secondary)] px-1.5 py-0.5">
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)] text-sm text-[var(--foreground)] disabled:opacity-50"
                              onClick={() => decrementQuantity(item._id)}
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="min-w-[24px] text-center text-sm font-bold text-[var(--foreground)]">{item.quantity}</span>
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)] text-sm text-[var(--foreground)] disabled:opacity-50"
                              onClick={() => incrementQuantity(item._id, item.stock || 99)}
                              aria-label="Increase quantity"
                              disabled={item.quantity >= (item.stock || 99)}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-col items-center md:items-end">
                            <span className="text-xs text-[var(--muted-foreground)]">{item.price} ETB</span>
                            <span className="text-sm font-extrabold text-[var(--foreground)]">{item.price * item.quantity} ETB</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-lg text-[var(--destructive)] md:static"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky top-5">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)]">
                    <h3 className="mb-4 border-b border-[var(--border)] pb-2 text-base font-extrabold text-[var(--foreground)]">Order Summary</h3>

                    <div className="mb-3 flex justify-between text-[var(--foreground)]">
                      <span className="text-xs text-[var(--muted-foreground)]">Subtotal ({itemCount} items)</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{total} ETB</span>
                    </div>

                    <div className="mb-3 flex justify-between text-[var(--foreground)]">
                      <span className="text-xs text-[var(--muted-foreground)]">Delivery Fee</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">50 ETB</span>
                    </div>

                    <div className="mb-3 flex justify-between text-[var(--foreground)]">
                      <span className="text-xs text-[var(--muted-foreground)]">Tax</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{(total * 0.15).toFixed(2)} ETB</span>
                    </div>
                    <div className="my-3 h-px bg-[var(--border)]"></div>

                    <div className="my-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-[var(--foreground)]">Total</span>
                      <span className="text-xl font-black text-[var(--primary)]">
                        {(total + 50 + total * 0.15).toFixed(2)} ETB
                      </span>
                    </div>
                    <button
                      className="mb-3 w-full rounded-lg border-none bg-[var(--primary)] py-2.5 text-sm font-bold text-[var(--primary-foreground)]"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      className="w-full rounded-lg border border-[var(--destructive)] bg-transparent py-2 text-xs font-semibold text-[var(--destructive)]"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

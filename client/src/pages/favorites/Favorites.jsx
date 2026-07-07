import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, Package, BadgeCheck, Search, Sun, Moon, Monitor, User, Settings, LogOut, Leaf, ChevronLeft, ChevronDown, Filter, Tag } from 'lucide-react';
import Footer from '../../components/Footer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import api from '../../api';

const fmt = (n) => Number(n).toFixed(2);
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

const getStoredFavoriteIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    return Array.isArray(saved) ? saved.map((id) => String(id)) : [];
  } catch (error) {
    console.error('Failed to parse stored favorites:', error);
    return [];
  }
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ cartCount, favoritesCount, isOpen, onClose }) => {
  const baseMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl text-[var(--muted-foreground)] font-medium transition-all hover:bg-[var(--secondary)] hover:text-[var(--primary)] group";
  const activeMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all bg-[var(--secondary)] text-[var(--primary)]";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] p-6 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🌾</span>
                </div>
                <h1 className="text-lg font-extrabold flex items-center">
                  <span className="text-[var(--primary)]">Farm</span>
                  <span className="text-[var(--foreground)]">Connect</span>
                </h1>
              </Link>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] font-medium mb-8 pl-1">Fresh from Farm to You</p>

          {/* Core Shopping Sidebar Links */}
          <nav className="space-y-1">
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
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">{favoritesCount}</span>
              )}
            </NavLink>

            <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span> <span>Cart</span>
              </div>
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">{cartCount || 0}</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Promo Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-2xl p-4 mt-6 relative overflow-hidden group border border-emerald-200 dark:border-emerald-700">
          <div className="relative z-10">
            <h3 className="text-[var(--foreground)] font-bold text-base mb-1">Fresh Deals!</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-3 max-w-[120px]">Get up to 20% off on selected products</p>
            <Link to="/" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg">
              Shop Now
            </Link>
          </div>
          <span className="absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 pointer-events-none group-hover:scale-110 transition-transform duration-500">🧺</span>
        </div>
      </aside>
    </>
  );
};

// ─── Dashboard Header ───────────────────────────────────────────────────────
const DashboardHeader = ({ user, cartCount, onLogout, onMenuToggle, favoritesCount }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] mr-2 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Universal Search Bar */}
      <div className="flex items-center w-full max-w-xl bg-[var(--secondary)] border border-[var(--border)] rounded-xl overflow-hidden px-4 py-1.5 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
        <input
          type="text"
          placeholder="Search for products or sellers..."
          className="bg-transparent w-full text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none py-1"
        />
        <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white p-2 rounded-lg transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      {/* Global Action Icons */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div onClick={() => navigate('/customer/dashboard/notifications')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">3</span>
        </div>
        <div onClick={() => navigate('/favorites')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
          <span className="text-xl">🤍</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{favoritesCount}</span>
          )}
        </div>
        <div onClick={() => navigate('/customer/cart')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
          <span className="text-xl">🛒</span>
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">{cartCount || 0}</span>
        </div>

        {/* User Interactive Menu Context */}
        <div className="flex items-center gap-3 border-l pl-4 sm:pl-6 border-[var(--border)] relative group">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"}
            alt="User profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
          />
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1 cursor-default">
              Hi, {user?.name || "Selam!"}
            </p>
          </div>

          <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold px-1 text-xl transition-colors ml-1 focus:outline-none">
            &#8942;
          </button>

          {/* 3-Dot Dropdown Actions Panel */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">

            <button onClick={() => navigate('/customer/dashboard/notifications')} className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left transition-colors">
              <div className="flex items-center gap-3">
                <span>🔔</span> Notifications
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button onClick={() => navigate('/customer/profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left transition-colors">
              <span>👤</span> Profile
            </button>
            <button onClick={() => navigate('/customer/dashboard/orders')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left transition-colors">
              <span>🛍️</span> My Orders
            </button>
            <button onClick={() => navigate('/customer/dashboard/reviews')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left transition-colors">
              <span>⭐</span> My Reviews
            </button>
            <button onClick={() => navigate('/customer/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left transition-colors">
              <span>⚙️</span> Settings
            </button>
            <hr className="my-1 border-[var(--border)]" />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-left transition-colors">
              <span>📤</span> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Vendor Badge ─────────────────────────────────────────────────────────────
const VendorBadge = ({ name, verified }) => (
  <div className="flex items-center gap-1.5">
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 45%), hsl(${(name.charCodeAt(0) * 37) % 360}, 65%, 55%))` }}
    >
      {name[0]}
    </div>
    <span className="text-[10px] font-semibold text-neutral-500 truncate">{name}</span>
    {verified && <BadgeCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
  </div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart, className = '' }) => {
  const {
    id, name, price, rating = 0, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 0, discountPercent = 0, unit = 'kg', badge, category,
    description, stock = 0, discountPrice,
  } = product;

  const finalPrice = Number(discountPrice ?? (discountPercent > 0 ? price * (1 - discountPercent / 100) : price) ?? price);
  const hasDiscount = discountPercent > 0 || (discountPrice && Number(discountPrice) < Number(price));
  const stockStatus = stock > 20 ? 'In stock' : stock > 0 ? 'Low stock' : 'Out of stock';
  const stockTone = stock > 20 ? 'text-emerald-600' : stock > 0 ? 'text-amber-600' : 'text-rose-600';

  return (
    <Link to={`/product/${id}`} className="block h-full">
      <div className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-md ${className}`}>
        <div className="relative w-full overflow-hidden bg-[var(--secondary)]" style={{ height: '102px' }}>
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.background = '#f0fdf4';
            }}
          />

          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            {hasDiscount && (
              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                {discountPercent > 0 ? `${discountPercent}% OFF` : 'Sale'}
              </span>
            )}
            {badge && (
              <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-semibold text-amber-950 shadow-sm">
                {badge}
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart className={`h-3 w-3 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-2.5">
          <VendorBadge name={vendor} verified={vendorVerified} />

          <h3 className="mt-1 line-clamp-1 text-[12px] font-semibold leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
            {name}
          </h3>

          {category && (
            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{category}</p>
          )}

          {description && (
            <p className="mt-1 line-clamp-2 text-[10px] text-[var(--muted-foreground)]">{description}</p>
          )}

          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-2.5 w-2.5 ${i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />
              ))}
            </div>
            <span className="text-[9px] text-[var(--muted-foreground)]">{Number(rating || 0).toFixed(1)} • {reviewsCount.toLocaleString()}</span>
          </div>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[var(--primary)]">{fmt(finalPrice)}</span>
            {hasDiscount && <span className="text-[9px] text-[var(--muted-foreground)] line-through">{fmt(price)}</span>}
            <span className="text-[8px] text-[var(--muted-foreground)]">/{unit}</span>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] text-[var(--muted-foreground)]">
            <span className={`truncate ${stockTone}`}>{stockStatus}</span>
            <span className="truncate">{vendor}</span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-2 py-1.5 text-[10px] font-semibold text-white shadow-sm transition-all hover:opacity-90"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

// ─── Public Header ───────────────────────────────────────────────────────────
const PublicHeader = ({ cartCount, theme, setTheme }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  return (
    <header className="bg-[var(--card)] text-[var(--foreground)] sticky top-0 z-50 shadow-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Logo — left */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm">FC</span>
          </div>
          <span className="text-lg font-extrabold text-[var(--primary)] tracking-tight">FarmConnect</span>
        </Link>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Search + Category + Sort */}
        <div className="flex flex-1 flex-col gap-2 mx-4 max-w-3xl md:flex-row md:items-center md:gap-3">
          <div className="flex items-center w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl overflow-hidden px-3 py-1 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or sellers..."
              className="flex-1 bg-transparent text-sm outline-none text-[var(--foreground)]"
            />
            <button
              onClick={() => navigate(`/market?search=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}&sort=${encodeURIComponent(sortBy)}`)}
              className="p-2 text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap md:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-[var(--card)] text-sm text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                  {category}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[var(--card)] border border-[var(--border)] shadow-lg">
                {['All', 'Fruits', 'Vegetables', 'Coffee', 'Grains', 'Legumes'].map(cat => (
                  <DropdownMenuItem key={cat} onClick={() => setCategory(cat)} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-[var(--card)] text-sm text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                  Sort: {sortBy}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[var(--card)] border border-[var(--border)] shadow-lg">
                {['Popular', 'Price: Low to High', 'Price: High to Low', 'Newest'].map(s => (
                  <DropdownMenuItem key={s} onClick={() => setSortBy(s)} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {/* Theme Toggle (bright/light) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-9 h-9 hover:bg-[var(--secondary)] rounded-xl transition-all text-[var(--foreground)]">
                {(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? (
                  <Moon className="w-4.5 h-4.5" />
                ) : (
                  <Sun className="w-4.5 h-4.5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[var(--card)] border border-[var(--border)] shadow-lg">
              <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                <Monitor className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <button
            onClick={() => navigate('/customer/cart')}
            className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const { addToCart, cart } = useCart();
  const { user, logout } = useAuth();

  // Calculate cart total from CartContext
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favoriteProducts.length;

  useEffect(() => {
    const root = window.document.documentElement;

    // First remove all classes
    root.classList.remove('light', 'dark');

    if (theme === 'dark') {
      // Bright dark theme colors
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
    } else if (theme === 'light') {
      // Light theme colors
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
    localStorage.setItem('theme', theme);
  }, [theme]);

  const refreshFavorites = async () => {
    if (!user) {
      const storedIds = getStoredFavoriteIds();
      if (storedIds.length === 0) {
        setFavoriteProducts([]);
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/products');
        const products = Array.isArray(response?.data?.data) ? response.data.data : [];
        const matchedProducts = products.filter((product) => storedIds.includes(String(product.id)));
        setFavoriteProducts(matchedProducts);
        setFavorites(matchedProducts.map((item) => String(item.id)));
        localStorage.setItem('favorites', JSON.stringify(matchedProducts.map((item) => String(item.id))));
      } catch (error) {
        console.error('Failed to load local favorites:', error);
        setFavoriteProducts([]);
        setFavorites(storedIds);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/favorites');
      const items = Array.isArray(response?.data?.data) ? response.data.data : [];
      const storedIds = getStoredFavoriteIds();
      const favoriteIds = items.map((item) => String(item.id));
      const mergedIds = Array.from(new Set([...favoriteIds, ...storedIds.filter((id) => !favoriteIds.includes(id))]));

      if (items.length > 0 || mergedIds.length === 0) {
        setFavoriteProducts(items);
        setFavorites(favoriteIds);
        localStorage.setItem('favorites', JSON.stringify(favoriteIds));
        return;
      }

      const productsResponse = await api.get('/products');
      const products = Array.isArray(productsResponse?.data?.data) ? productsResponse.data.data : [];
      const matchedProducts = products.filter((product) => mergedIds.includes(String(product.id)));
      setFavoriteProducts(matchedProducts);
      setFavorites(matchedProducts.map((item) => String(item.id)));
      localStorage.setItem('favorites', JSON.stringify(matchedProducts.map((item) => String(item.id))));
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavoriteProducts([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user?.id]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      refreshFavorites();
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('favoritesUpdated', handleStorageUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('favoritesUpdated', handleStorageUpdate);
    };
  }, [user?.id]);

  const toggleFavorite = async (id) => {
    if (!user) {
      toast.error('Please sign in to manage favorites.');
      return;
    }

    const normalizedId = String(id);
    const isFav = favorites.includes(normalizedId);

    try {
      if (isFav) {
        await api.delete(`/favorites/${normalizedId}`);
      } else {
        await api.post('/favorites/add', { productId: normalizedId });
      }

      await refreshFavorites();
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to update favorite:', error);
      toast.error('Unable to update favorites right now.');
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
    toast.success(`${product.name} added to cart!`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--secondary)] text-[var(--foreground)] antialiased">
        <PublicHeader cartCount={cartCount} theme={theme} setTheme={setTheme} />
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-5 text-white shadow-xl sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-50 backdrop-blur-sm">
                  Favorites
                </div>
                <h1 className="text-2xl font-bold sm:text-3xl">Your saved picks</h1>
                <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                  Sign in to view the products you have saved from our marketplace.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-6 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]/60" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Please sign in</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
              Your favorites are linked to your account, so sign in to see the real products saved here.
            </p>
            <Link to="/login" className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
              Go to Sign In
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--secondary)] text-[var(--foreground)] antialiased">
      <PublicHeader cartCount={cartCount} theme={theme} setTheme={setTheme} />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-5 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-50 backdrop-blur-sm">
                Favorites
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">Your saved picks</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
                Keep the products you love close at hand and revisit them whenever you are ready to buy.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm shadow-sm">
              <p className="text-2xl font-bold">{favoritesCount}</p>
              <p className="text-xs text-emerald-50/90">saved items</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">Wishlist</p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Saved favorites</h2>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-emerald-50 to-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-600 shadow-sm dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-400">
              {favoritesCount} saved items
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-2.5">
                  <div className="h-24 rounded-xl bg-[var(--border)]" />
                  <div className="mt-2 h-2.5 w-16 rounded bg-[var(--border)]" />
                  <div className="mt-2 h-3 w-20 rounded bg-[var(--border)]" />
                  <div className="mt-2 h-7 rounded-lg bg-[var(--border)]" />
                </div>
              ))}
            </div>
          ) : favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {favoriteProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={favorites.includes(String(p.id))}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--border)] bg-gradient-to-br from-[var(--secondary)] to-[var(--card)] p-10 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <Heart className="h-12 w-12 text-[var(--muted-foreground)]/50" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">No favorite products yet</h3>
              <p className="mx-auto mb-5 max-w-md text-sm text-[var(--muted-foreground)]">
                Save products from the marketplace and they will appear here with their real details from the database.
              </p>
              <Link to="/market" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
                Browse marketplace
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, Package, BadgeCheck, Search, Sun, Moon, Monitor, User, Settings, LogOut, Leaf, ChevronLeft, ChevronDown, Filter, Tag } from 'lucide-react';
import CustomerFooter from '../dashbord/customer/footer/Footer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const fmt = (n) => Number(n).toFixed(2);
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ cartCount, favoritesCount, isOpen, onClose }) => {
  const baseMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl text-[var(--muted-foreground)] font-medium transition-all hover:bg-[var(--secondary)] hover:text-[var(--primary)] group";
  const activeMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all bg-[var(--secondary)] text-[var(--primary)]";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] p-6 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
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
              className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              )}
            </NavLink>

            <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span> <span>Cart</span>
              </div>
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cartCount || 0}</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Promo Card */}
        <div className="bg-[var(--secondary)] rounded-2xl p-4 mt-6 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-[var(--foreground)] font-bold text-base mb-1">Fresh Deals!</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-3 max-w-[120px]">Get up to 20% off on selected products</p>
            <Link to="/" className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-semibold text-xs px-4 py-2 rounded-lg transition-colors">
              Shop Now
            </Link>
          </div>
          <span className="absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 pointer-events-none group-hover:scale-110 transition-transform">🧺</span>
        </div>
      </aside>
    </>
  );
};

// ─── Dashboard Header ───────────────────────────────────────────────────────
const DashboardHeader = ({ user, cartCount, onLogout, onMenuToggle, favoritesCount }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] mr-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Universal Search Bar */}
      <div className="flex items-center w-full max-w-xl bg-[var(--secondary)] border border-[var(--border)] rounded-xl overflow-hidden px-4 py-1.5 focus-within:border-[var(--primary)] transition-colors">
        <input
          type="text"
          placeholder="Search for products or sellers..."
          className="bg-transparent w-full text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none py-1"
        />
        <button className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] p-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      {/* Global Action Icons */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div onClick={() => navigate('/customer/dashboard/notifications')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)]">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </div>
        <div onClick={() => navigate('/favorites')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)]">
          <span className="text-xl">🤍</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{favoritesCount}</span>
          )}
        </div>
        <div onClick={() => navigate('/customer/cart')} className="relative cursor-pointer p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)]">
          <span className="text-xl">🛒</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount || 0}</span>
        </div>

        {/* User Interactive Menu Context */}
        <div className="flex items-center gap-3 border-l pl-4 sm:pl-6 border-[var(--border)] relative group">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"}
            alt="User profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-100"
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

            <button onClick={() => navigate('/customer/dashboard/notifications')} className="w-full flex items-center justify-between px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left">
              <div className="flex items-center gap-3">
                <span>🔔</span> Notifications
              </div>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button onClick={() => navigate('/customer/profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left">
              <span>👤</span> Profile
            </button>
            <button onClick={() => navigate('/customer/dashboard/orders')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left">
              <span>🛍️</span> My Orders
            </button>
            <button onClick={() => navigate('/customer/dashboard/reviews')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left">
              <span>⭐</span> My Reviews
            </button>
            <button onClick={() => navigate('/customer/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] font-medium text-left">
              <span>⚙️</span> Settings
            </button>
            <hr className="my-1 border-[var(--border)]" />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium text-left">
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
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
      style={{ background: `hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 45%)` }}
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
    id, name, price, rating = 4.5, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 120, discountPercent = 0, unit = 'kg', badge, freeShipping,
    description,
  } = product;

  return (
    <Link to={`/product/${id}`} className="block">
      <div className={`group bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden ${className}`}>
        {/* Image */}
        <div className="relative w-full overflow-hidden bg-[var(--secondary)]" style={{ height: '200px' }}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.background = '#f0fdf4';
            }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                {discountPercent}% OFF
              </span>
            )}
            {badge && (
              <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                {badge}
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-all"
          >
            <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-4">
          <VendorBadge name={vendor} verified={vendorVerified} />

          <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] mt-1.5 leading-snug">
            {name}
          </h3>

          {description && (
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{description}</p>
          )}

          {/* Rating */}
          <div className="flex items-center mt-2 gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} />
              ))}
            </div>
            <span className="text-[11px] text-[var(--muted-foreground)]">({reviewsCount.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-[var(--primary)]">{fmt(price)}</span>
            {discountPercent > 0 && (
              <span className="text-xs text-[var(--muted-foreground)] line-through">{calcOriginal(price, discountPercent)}</span>
            )}
            <span className="text-[10px] text-[var(--muted-foreground)]">/{unit}</span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="w-full mt-3 py-2.5 bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] text-[var(--primary-foreground)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
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
    <header className="bg-[var(--card)] text-[var(--foreground)] sticky top-0 z-50 shadow-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Logo — left */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
            <span className="text-[var(--primary-foreground)] font-extrabold text-sm">FC</span>
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
          <div className="flex items-center w-full bg-[var(--secondary)] border border-[var(--border)] rounded-xl overflow-hidden px-3 py-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or sellers..."
              className="flex-1 bg-transparent text-sm outline-none text-[var(--foreground)]"
            />
            <button
              onClick={() => navigate(`/market?search=${encodeURIComponent(query)}&cat=${encodeURIComponent(category)}&sort=${encodeURIComponent(sortBy)}`)}
              className="p-2 text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--secondary)]"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap md:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-[var(--card)] text-sm text-[var(--foreground)] border-[var(--border)]">
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
                <button className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-[var(--card)] text-sm text-[var(--foreground)] border-[var(--border)]">
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
            className="relative flex items-center justify-center w-10 h-10 bg-[var(--secondary)] hover:bg-[var(--secondary)]/90 text-[var(--primary)] rounded-xl font-bold transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-[var(--primary-foreground)] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
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
  const { theme, setTheme } = useTheme();
  const { addToCart, cart } = useCart();
  const { user, logout } = useAuth();

  // Calculate cart total from CartContext
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const products = [
    { id: 1, name: 'Fresh Organic Tomatoes', price: 25.00, image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=400&q=80', description: 'Locally grown organic tomatoes, perfect for salads and cooking', unit: 'kg', discountPercent: 10, vendor: 'Green Valley Farm', vendorVerified: true, rating: 4.8, reviewsCount: 45, badge: 'Organic', category: 'vegetables', stock: 50 },
    { id: 2, name: 'Premium Coffee Beans', price: 120.00, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', description: 'Ethiopian Yirgacheffe coffee beans, freshly roasted', unit: 'kg', discountPercent: 0, vendor: 'Highland Coffee Co.', vendorVerified: true, rating: 4.9, reviewsCount: 89, badge: 'Best Seller', category: 'coffee', stock: 30 },
    { id: 3, name: 'Fresh Strawberries', price: 45.00, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', description: 'Sweet and juicy strawberries, hand-picked daily', unit: 'kg', discountPercent: 15, vendor: 'Berry Farm', vendorVerified: true, rating: 4.7, reviewsCount: 62, badge: 'Fresh Daily', category: 'fruits', stock: 25 },
    { id: 4, name: 'Organic Lentils', price: 35.00, image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&q=80', description: 'High-protein organic lentils, perfect for healthy meals', unit: 'kg', discountPercent: 5, vendor: 'Grain Harvest', vendorVerified: true, rating: 4.6, reviewsCount: 38, badge: 'Organic', category: 'legumes', stock: 100 },
    { id: 5, name: 'Fresh Spinach', price: 20.00, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', description: 'Crisp organic spinach, rich in vitamins and minerals', unit: 'bunch', discountPercent: 0, vendor: 'Green Valley Farm', vendorVerified: true, rating: 4.5, reviewsCount: 29, badge: 'Organic', category: 'vegetables', stock: 40 },
    { id: 6, name: 'Honey', price: 80.00, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', description: 'Pure natural honey from local beekeepers', unit: 'jar', discountPercent: 20, vendor: 'Mountain Honey', vendorVerified: true, rating: 4.9, reviewsCount: 76, badge: 'Natural', category: 'other', stock: 15 },
    { id: 7, name: 'Fresh Carrots', price: 18.00, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80', description: 'Sweet and crunchy organic carrots', unit: 'kg', discountPercent: 0, vendor: 'Root Vegetable Farm', vendorVerified: true, rating: 4.4, reviewsCount: 34, badge: 'Organic', category: 'vegetables', stock: 60 },
    { id: 8, name: 'Avocados', price: 55.00, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', description: 'Creamy ripe avocados, perfect for toast and salads', unit: 'kg', discountPercent: 10, vendor: 'Tropical Farms', vendorVerified: true, rating: 4.7, reviewsCount: 52, badge: 'Premium', category: 'fruits', stock: 35 },
  ];

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

  // Load favorites from localStorage on mount
  useEffect(() => {
    const normalizeFavorites = (value) => {
      if (!Array.isArray(value)) return [];
      return value.map((item) => String(item));
    };

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(normalizeFavorites(JSON.parse(savedFavorites)));
      } catch {
        setFavorites([]);
      }
    }

    const updateFavorites = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          setFavorites(normalizeFavorites(JSON.parse(saved)));
        } catch {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    };

    window.addEventListener('storage', updateFavorites);
    window.addEventListener('favoritesUpdated', updateFavorites);
    return () => {
      window.removeEventListener('storage', updateFavorites);
      window.removeEventListener('favoritesUpdated', updateFavorites);
    };
  }, []);

  const toggleFavorite = (id) => {
    const normalizedId = String(id);
    const isFav = favorites.includes(normalizedId);
    const newFavorites = isFav ? favorites.filter((favoriteId) => favoriteId !== normalizedId) : [...favorites, normalizedId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    toast[isFav ? 'error' : 'success'](isFav ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
    toast.success(`${product.name} added to cart!`);
  };

  const favoriteProducts = products.filter((product) => favorites.includes(String(product.id)));
  const favoritesCount = favoriteProducts.length;

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <PublicHeader cartCount={cartCount} theme={theme} setTheme={setTheme} />
        <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-50">
                  Wishlist
                </div>
                <h1 className="text-3xl font-black sm:text-4xl">Your favorite picks</h1>
                <p className="mt-2 max-w-2xl text-sm text-emerald-50 sm:text-base">
                  Save products you love and come back whenever you’re ready to shop.
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-3xl font-black">{favoriteProducts.length}</p>
                <p className="text-sm text-emerald-50">saved items</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--card)]/90 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Wishlist</p>
                <h2 className="text-2xl font-black text-[var(--foreground)]">Saved favorites</h2>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
                {favoriteProducts.length} saved items
              </div>
            </div>

            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {favoriteProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFavorite={favorites.includes(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--secondary)]/70 p-12 text-center">
                <Heart className="mx-auto mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
                <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">No favorites yet</h3>
                <p className="mb-6 text-sm text-[var(--muted-foreground)]">Start adding products you love to your wishlist.</p>
                <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700">
                  Browse Products
                </Link>
              </div>
            )}
          </section>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
      <PublicHeader cartCount={cartCount} theme={theme} setTheme={setTheme} />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-50">
                Wishlist
              </div>
              <h1 className="text-3xl font-black sm:text-4xl">Your favorite picks</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50 sm:text-base">
                Keep the products you love close at hand and come back whenever you’re ready to buy.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-3xl font-black">{favoriteProducts.length}</p>
              <p className="text-sm text-emerald-50">saved items</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--card)]/90 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">Wishlist</p>
              <h2 className="text-2xl font-black text-[var(--foreground)]">Saved favorites</h2>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
              {favoriteProducts.length} saved items
            </div>
          </div>

          {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {favoriteProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--secondary)]/70 p-12 text-center">
              <Heart className="mx-auto mb-4 h-16 w-16 text-[var(--muted-foreground)]" />
              <h3 className="mb-2 text-xl font-bold text-[var(--foreground)]">No favorites yet</h3>
              <p className="mb-6 text-sm text-[var(--muted-foreground)]">Start adding products you love to your wishlist.</p>
              <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700">
                Browse Products
              </Link>
            </div>
          )}
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
};

export default Favorites;
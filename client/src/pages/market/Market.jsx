
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import api from '../../api';
import { useCachedProducts, useLiveProductsPriceStock } from '../../hooks/useProducts';

import { Heart, Star, ShoppingCart, ChevronLeft, Search, Sun, Moon, Monitor, Menu, X, User, Package, Settings, LogOut, ChevronRight, Grid, List } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const fmt = (n) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
};
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

// Define categories outside component to prevent re-creation
const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Coffee', 'Legumes', 'Other'];

const VendorBadge = ({ name, verified }) => (
  <div className="flex items-center gap-1.5">
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-sm"
      style={{ background: `linear-gradient(135deg, hsl(${(name.charCodeAt(0) * 37) % 360}, 55%, 45%), hsl(${(name.charCodeAt(0) * 37) % 360}, 65%, 55%))` }}
    >
      {name[0]}
    </div>
    <span className="text-[10px] font-semibold text-neutral-500 truncate">{name}</span>
    {verified && <Heart className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
  </div>
);

const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart }) => {
  const {
    id, name, price, rating = 0, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 0, hasDiscount: productHasDiscount = false, badges = [], isOrganic = false, unit = 'kg',
    description, stock = 0, discountPrice, category,
  } = product;

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const finalPrice = Number(price);
  const stockStatus = stock > 20 ? 'In stock' : stock > 0 ? 'Low stock' : 'Out of stock';
  const stockTone = stock > 20 ? 'text-emerald-600' : stock > 0 ? 'text-amber-600' : 'text-rose-600';

  return (
    <Link to={`/product/${id}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary)]/40 hover:shadow-md">
        <div
          className="relative w-full overflow-hidden bg-[var(--secondary)]"
          style={{ height: '140px' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-all duration-300 ease-out"
            style={{
              transform: isZoomed ? `scale(2)` : 'scale(1)',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.background = '#f0fdf4';
            }}
          />

          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
            {isOrganic && (
              <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-950 shadow-sm">
                Organic
              </span>
            )}
            {/* Show other non-discount badges */}
            {badges.filter(b => 
                !(b.toLowerCase().includes('sale') || 
                  b.toLowerCase().includes('discount') || 
                  b.toLowerCase().includes('off'))
            ).map((badge, idx) => (
              <span key={idx} className="rounded-md bg-slate-500 px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm">
                {badge}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart className={`h-4 w-4 transition-all ${isFavorite ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-neutral-400'}`} />
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

const Market = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cart } = useCart();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Use our custom hooks for products
  const { data: cachedProductsData, isLoading: cachedProductsLoading } = useCachedProducts({
    search: searchQuery || undefined,
    category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
    sortBy,
    limit: 50
  });
  const productIds = cachedProductsData?.map(p => p.id) || [];
  const { data: livePriceStockData } = useLiveProductsPriceStock(productIds);
  
  // Combine cached product data with live price/stock
  const products = (cachedProductsData || []).map(cachedProduct => {
    const liveData = livePriceStockData?.find(lp => lp.id === cachedProduct.id);
    return {
      ...cachedProduct,
      id: cachedProduct.id ?? cachedProduct._id ?? cachedProduct.productId,
      name: cachedProduct.name ?? 'Untitled product',
      description: cachedProduct.description ?? '',
      image: cachedProduct.image ?? cachedProduct.images?.[0] ?? '',
      vendor: cachedProduct.vendor ?? cachedProduct.farmer?.farmName ?? cachedProduct.farmer?.name ?? 'Fresh Vendor',
      category: cachedProduct.category ?? 'Other',
      price: liveData?.price ?? 0,
      discountPrice: liveData?.discountPrice ?? cachedProduct.cachedDiscountPrice,
      stock: liveData?.stock ?? 0,
      rating: cachedProduct.rating,
      reviewsCount: cachedProduct.reviewsCount,
      hasDiscount: cachedProduct.hasDiscount || !!liveData?.discountPrice,
      badges: cachedProduct.badges || [],
      isOrganic: cachedProduct.isOrganic,
      unit: cachedProduct.unit
    };
  });
  
  const loading = cachedProductsLoading;

  // URL params
  const categoryParam = searchParams.get('cat');
  const searchParam = searchParams.get('search');
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set initial search query from URL
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);





  // Set initial category from URL
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam.replace('-', ' & '));
    }
  }, [categoryParam]);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((p) => {
        const category = p.category || '';
        return category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) => {
        const name = p.name || '';
        const description = p.description || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) || description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery, sortBy]);



  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4"></div>
          <p className="text-[var(--foreground)]">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm">
        <Header pageType="market" />
      </div>

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--card)] shadow-2xl flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div>
                  {user ? (
                    <p className="text-sm font-bold text-[var(--foreground)]">{user?.name || user?.email}</p>
                  ) : (
                    <p className="text-sm font-bold text-[var(--foreground)]">Guest User</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 hover:bg-[var(--secondary)] rounded-lg transition-all text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link
                to="/favorites"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/favorites'
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5" />
                Favorites
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </Link>
              {user ? (
                <>
                  <Link
                    to="/customer/profile"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/customer/profile'
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Profile
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                  <Link
                    to="/customer/orders"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname.startsWith('/customer/orders')
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                  <Link
                    to="/customer/settings"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === '/customer/settings'
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Sign Up
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
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
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb + Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Home
          </Link>
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="relative flex-1 sm:w-80"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all shadow-sm"
            />
          </form>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">All Products</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[var(--muted-foreground)]">{filteredProducts.length} products found</p>
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-40 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
            >
              <option value="newest">Featured</option>
              <option value="rating">Best Sellers</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[var(--card)] rounded-2xl p-12 sm:p-16 text-center border border-[var(--border)]">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                <Search className="w-10 h-10 text-[var(--muted-foreground)]" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">No products found</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">No products match the current filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${viewMode === 'grid'
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              : 'grid-cols-1'
            }`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, id: product.id }}
                isFavorite={isFavorite(String(product.id))}
                onToggleFavorite={toggleFavorite}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Market;

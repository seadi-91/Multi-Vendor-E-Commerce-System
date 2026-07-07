
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, ChevronLeft, Search, Sun, Moon, Monitor, Menu, X, User, Package, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const fmt = (n) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
};
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart }) => {
  const {
    id, name, price, rating = 4.5, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 0, discountPercent = 0, unit = 'kg', badge, description,
  } = product;

  const safePrice = Number(price) || 0;
  const safeRating = Number(rating) || 0;
  const safeReviewsCount = Number(reviewsCount) || 0;
  const safeDiscountPercent = Number(discountPercent) || 0;

  return (
    <Link to={`/product/${id}`} className="block">
      <Card className="group bg-[var(--card)] rounded-lg sm:rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative w-full overflow-hidden bg-[var(--secondary)]" style={{ height: '120px' }}>
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = 'var(--secondary)';
              }}
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {safeDiscountPercent > 0 && (
                <Badge variant="destructive" className="text-[8px] font-extrabold px-2 py-0.5">
                  {safeDiscountPercent}% OFF
                </Badge>
              )}
              {badge && (
                <Badge variant="secondary" className="text-[8px] font-extrabold px-2 py-0.5">
                  {badge}
                </Badge>
              )}
            </div>

            {/* Favorite */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
              className="absolute top-2 right-2 w-7 h-7 bg-[var(--card)]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10"
            >
              <Heart className={`w-3 h-3 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[var(--muted-foreground)]'}`} />
            </button>
          </div>
        </CardContent>

        <CardContent className="flex-1 flex flex-col p-2 sm:p-5">
          <h3 className="text-[11px] sm:text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] leading-tight line-clamp-1">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mt-1.5 gap-1">
            <div className="flex gap-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(safeRating) ? 'text-amber-400 fill-amber-400' : 'text-[var(--muted-foreground)]/30'}`} />
              ))}
            </div>
            <span className="text-[9px] sm:text-xs text-[var(--muted-foreground)] font-medium">({safeReviewsCount})</span>
          </div>

          {/* Price */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-1.5 border-t border-[var(--border)]">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs sm:text-lg font-extrabold text-[var(--primary)]">{fmt(safePrice)}</span>
              {safeDiscountPercent > 0 && (
                <span className="text-[9px] sm:text-xs text-[var(--muted-foreground)] line-through">{calcOriginal(safePrice, safeDiscountPercent)}</span>
              )}
              <span className="text-[8px] sm:text-xs text-[var(--muted-foreground)]">/{unit}</span>
            </div>
            <Button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
              size="sm"
              className="h-6 px-2"
            >
              <ShoppingCart className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Market = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, cart } = useCart();
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Define available categories
  const categories = ['All', 'Vegetables', 'Fruits', 'Coffee', 'Legumes', 'Other'];

  const categoryParam = searchParams.get('cat');
  const searchParam = searchParams.get('search');

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'dark') {
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
      root.style.setProperty('--background', 'oklch(1 0 0)');
      root.style.setProperty('--foreground', 'oklch(0.12 0 0)');
      root.style.setProperty('--card', 'oklch(0.995 0 0)');
      root.style.setProperty('--card-foreground', 'oklch(0.12 0 0)');
      root.style.setProperty('--popover', 'oklch(0.995 0 0)');
      root.style.setProperty('--popover-foreground', 'oklch(0.12 0 0)');
      root.style.setProperty('--primary', '#059669');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', 'oklch(0.97 0 0)');
      root.style.setProperty('--secondary-foreground', 'oklch(0.18 0 0)');
      root.style.setProperty('--muted', 'oklch(0.97 0 0)');
      root.style.setProperty('--muted-foreground', 'oklch(0.55 0 0)');
      root.style.setProperty('--accent', 'oklch(0.97 0 0)');
      root.style.setProperty('--accent-foreground', 'oklch(0.18 0 0)');
      root.style.setProperty('--destructive', 'oklch(0.6 0.22 25)');
      root.style.setProperty('--border', 'oklch(0.92 0 0)');
      root.style.setProperty('--input', 'oklch(0.92 0 0)');
      root.style.setProperty('--ring', '#059669');
      root.style.setProperty('--sidebar', 'oklch(0.995 0 0)');
      root.style.setProperty('--sidebar-foreground', 'oklch(0.12 0 0)');
      root.style.setProperty('--sidebar-primary', '#059669');
      root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
      root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
      root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.18 0 0)');
      root.style.setProperty('--sidebar-border', 'oklch(0.92 0 0)');
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
        root.style.setProperty('--secondary', 'oklch(0.25 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--muted', 'oklch(0.25 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.75 0 0)');
        root.style.setProperty('--accent', 'oklch(0.25 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.628 0.258 25.331)');
        root.style.setProperty('--border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--input', 'oklch(1 0 0 / 15%)');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.25 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else {
        root.style.setProperty('--background', 'oklch(1 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.12 0 0)');
        root.style.setProperty('--card', 'oklch(0.995 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.12 0 0)');
        root.style.setProperty('--popover', 'oklch(0.995 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.12 0 0)');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.97 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.18 0 0)');
        root.style.setProperty('--muted', 'oklch(0.97 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.55 0 0)');
        root.style.setProperty('--accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.18 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.6 0.22 25)');
        root.style.setProperty('--border', 'oklch(0.92 0 0)');
        root.style.setProperty('--input', 'oklch(0.92 0 0)');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', 'oklch(0.995 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.12 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.18 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(0.92 0 0)');
        root.style.setProperty('--sidebar-ring', '#059669');
      }
    }
  }, [theme]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set initial search query from URL
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products', {
          params: {
            search: searchQuery || undefined,
            category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : undefined,
            sortBy,
            limit: 50
          }
        });
        const payload = response.data;
        const productsData = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        const mappedProducts = productsData.map((product) => ({
          ...product,
          id: product.id ?? product._id,
          price: Number(product.price) || 0,
          rating: Number(product.rating) || 0,
          reviewsCount: Number(product.reviewsCount) || 0,
          discountPercent: Number(product.discountPercent) || 0,
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

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

  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id);
    const newFavorites = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast[isFav ? 'error' : 'success'](isFav ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
    toast.success(`${product.name} added to cart!`);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
      {/* Header */}
      <header className="bg-[var(--card)] sticky top-0 z-50 shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 md:gap-3">
            <button onClick={() => navigate(-1)} className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Search Bar - Minimized Width */}
            <div className="flex-1 max-w-xs min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 hover:bg-[var(--secondary)] rounded-lg transition-all text-[var(--foreground)]">
                    {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
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

              {/* Favorites - Hidden on mobile */}
              <Link
                to="/favorites"
                className="hidden sm:flex items-center justify-center w-8 h-8 hover:bg-[var(--secondary)] rounded-lg relative transition-all"
              >
                <Heart className="w-4 h-4 text-[var(--foreground)] hover:text-rose-500 transition-colors" />
                {favorites.filter(f => !String(f).startsWith('cat-')).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {favorites.filter(f => !String(f).startsWith('cat-')).length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/customer/cart"
                className="flex items-center justify-center w-8 h-8 hover:bg-[var(--secondary)] rounded-lg relative transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-[var(--foreground)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle - Rightmost on mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-8 h-8 hover:bg-[var(--secondary)] rounded-lg transition-all text-[var(--foreground)]"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sort Dropdown and Title/Count */}
          <div className="mt-3 sm:mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[var(--foreground)]">
                {selectedCategory && selectedCategory !== 'All' ? `${selectedCategory}` : 'All Products'}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">{filteredProducts.length} products found</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              {/* Category Dropdown */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[120px] sm:w-[140px] bg-[var(--secondary)] hover:bg-[var(--secondary)] border-[var(--border)]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-[var(--foreground)]">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] sm:w-[140px] bg-[var(--secondary)] hover:bg-[var(--secondary)] border-[var(--border)]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border-[var(--border)]">
                  <SelectItem value="newest" className="text-[var(--foreground)]">Newest</SelectItem>
                  <SelectItem value="price-low" className="text-[var(--foreground)]">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-[var(--foreground)]">Price: High to Low</SelectItem>
                  <SelectItem value="rating" className="text-[var(--foreground)]">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Products Grid */}
          <div className="col-span-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-[var(--card)] rounded-xl p-8 sm:p-12 text-center border border-[var(--border)]">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2">No products found</h3>
                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-bold rounded-lg text-xs sm:text-sm transition-colors"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{ ...product, id: product.id }}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;

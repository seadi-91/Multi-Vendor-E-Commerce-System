import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';

import api from '../../api';
import { useCachedProducts, useLiveProductsPriceStock } from '../../hooks/useProducts';
import logo from '../../assets/logo.jpg';
import farmconnectVideo from '../../assets/farmconnect.mp4';
import {
  Search, Heart, Star,
  ShoppingCart, MapPin, Sprout, Users, Truck,
  Shield, Package, Menu, X, ChevronDown, CheckCircle,
  Sparkles, LogOut, LayoutDashboard, User, Sun, Moon, Monitor, MoreVertical, Settings, ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

const fmt = (n) => Number(n).toFixed(2);
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart, className = '' }) => {
  const {
    id, name, price, rating = 4.5, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 120, hasDiscount = false, badges = [], isOrganic = false, unit = 'kg',
    description,
  } = product;
  
  // Get custom discount badge from badges array (first badge that looks like a discount, or just use first badge)
  const customDiscountBadge = badges.find(b => 
    b.toLowerCase().includes('sale') || 
    b.toLowerCase().includes('discount') || 
    b.toLowerCase().includes('off')
  ) || badges[0];

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <Link to={`/product/${id}`} className="block">
      <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border-[var(--border)] ${className}`}>
        <CardContent className="p-0">
          {/* Image Container */}
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
              className="w-full h-full object-cover transition-all duration-300 ease-out"
              style={{
                transform: isZoomed ? `scale(2)` : 'scale(1)',
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = '#f0fdf4';
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {isOrganic && (
                <Badge variant="secondary" className="text-[8px] font-extrabold px-2 py-0.5 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Organic
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
              className="absolute top-2 right-2 w-7 h-7 bg-[var(--card)]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10 border border-[var(--border)]"
            >
              <Heart className={`w-3 h-3 transition-all ${isFavorite ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
            </button>
          </div>
        </CardContent>

        <CardContent className="flex-1 flex flex-col p-2.5 sm:p-5">
          {/* Vendor and Verification */}
          <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] mb-0.5">
            <Sprout className="w-2.5 h-2.5 text-[var(--primary)]" />
            <span className="font-medium truncate max-w-[80px]">{vendor}</span>
          </div>

          <h3 className="text-[11px] sm:text-base font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] leading-tight line-clamp-1">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mt-1.5 gap-1">
            <div className="flex gap-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-[var(--muted-foreground)]/30'}`} />
              ))}
            </div>
            <span className="text-[9px] text-[var(--muted-foreground)] font-medium">({reviewsCount})</span>
          </div>

          {/* Price & Cart */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-1.5 border-t border-[var(--border)]">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs sm:text-lg font-black text-[var(--primary)]">{fmt(price)}</span>
              <span className="text-[8px] sm:text-xs text-[var(--muted-foreground)] font-semibold">/{unit}</span>
            </div>

            <Button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
              size="sm"
              variant="default"
              className="h-7 px-2.5 gap-1.5 text-xs font-bold"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};




// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Home = () => {
  const { theme } = useTheme();

  // Scroll handler for header state
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);


  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Use our custom hooks for products
  const { data: cachedProductsData, isLoading: cachedProductsLoading } = useCachedProducts({ limit: 8 });
  const productIds = cachedProductsData?.map(p => p.id) || [];
  const { data: livePriceStockData } = useLiveProductsPriceStock(productIds);
  
  // Combine cached product data with live price/stock
  const products = (cachedProductsData || []).map(cachedProduct => {
    const liveData = livePriceStockData?.find(lp => lp.id === cachedProduct.id);
    return {
      ...cachedProduct,
      id: cachedProduct.id || cachedProduct._id,
      price: liveData?.price ?? 0,
      discountPrice: liveData?.discountPrice ?? cachedProduct.cachedDiscountPrice,
      stock: liveData?.stock ?? 0,
      name: cachedProduct.name,
      image: cachedProduct.image || cachedProduct.images?.[0] || '',
      description: cachedProduct.description,
      unit: cachedProduct.unit,
      hasDiscount: cachedProduct.hasDiscount || !!liveData?.discountPrice,
      badges: cachedProduct.badges || [],
      isOrganic: cachedProduct.isOrganic,
      vendor: cachedProduct.vendor,
      vendorVerified: cachedProduct.vendorVerified,
      rating: cachedProduct.rating,
      reviewsCount: cachedProduct.reviewsCount,
      category: cachedProduct.category
    };
  });
  
  const loading = cachedProductsLoading;

  const [activeTab, setActiveTab] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);

  const fallbackCategories = products.reduce((acc, product) => {
    // Limit to only 4 categories
    if (acc.length >= 4) return acc;

    const categoryName = (product.category || '').trim();
    if (!categoryName) return acc;
    if (acc.some((item) => item.name.toLowerCase() === categoryName.toLowerCase())) return acc;

    acc.push({
      id: `fallback-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
      name: categoryName,
      categoryKey: categoryName.toLowerCase().replace(/\s+/g, '-'),
      mosaicImages: [product.image || '', product.image || '', product.image || '', product.image || '']
    });
    return acc;
  }, []);

  const categoriesToDisplay = categories.length > 0
    ? categories.slice(0, 4)  // Ensure only 4 categories
    : (!categoriesLoading && fallbackCategories.length > 0 ? fallbackCategories.slice(0, 4) : []);

  const { user, logout } = useAuth();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch first 4 categories with 4 products each in single request
        const response = await api.get('/products/categories-with-products');
        const data = response.data?.data || [];

        console.log('Categories with products fetched:', data.map(c => ({ id: c.id, name: c.name, imageCount: c.mosaicImages.length })));

        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories with products:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Keep favorites synchronized through the shared favorites context.
  // Only sync to localStorage for guest users.
  useEffect(() => {
    if (!user) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);



  const locations = [
    { name: 'Addis Ababa', code: 'AA' },
    { name: 'Gondar', code: 'GD' },
    { name: 'Hawassa', code: 'HS' },
    { name: 'Mekelle', code: 'MK' },
    { name: 'Bahir Dar', code: 'BD' },
    { name: 'Dire Dawa', code: 'DD' },
  ];



  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
  };

  const handleDashboardRedirect = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const routes = {
      CUSTOMER: '/customer/dashboard',
      FARMER: '/farmer/dashboard',
      ADMIN: '/admin/dashboard'
    };
    const userRole = user.role?.toUpperCase();
    const targetRoute = routes[userRole] || '/customer/dashboard';
    navigate(targetRoute);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Dynamic filter for products section
  const filteredProducts = products.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Organic') return p.isOrganic;
    if (activeTab === 'Discounted') return p.hasDiscount;
    if (activeTab === 'Top Rated') return p.rating >= 4.5;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* ── Fixed Header ── */}
      <Header pageType="home" />

      {/* ── Hero Video Section ── */}
      <section className="relative overflow-hidden bg-[var(--card)] min-h-[85vh] md:min-h-[90vh] lg:h-screen w-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={farmconnectVideo} type="video/mp4" />
        </video>
      </section>

      {/* ── Showcase: Shop by Category ── */}
      <section className="pt-4 pb-0 bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-[var(--primary)] uppercase mb-2">
                <Sprout className="w-3.5 h-3.5" />
                CATEGORIES
              </div>
              <h2 className="text-2xl md:text-3.5xl font-black text-[var(--foreground)] tracking-tight">Browse Fresh Harvest</h2>
              <p className="text-[var(--muted-foreground)] mt-2 text-xs md:text-sm font-medium">Connect with growers through targeted category selections.</p>
            </div>
            <Link
              to="/market"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary)]/90 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 px-4.5 py-2.5 rounded-xl transition-all self-start md:self-auto"
            >
              <span>View Full Marketplace</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Categories Grid */}
          {categoriesLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 h-[240px] md:h-[280px] animate-pulse">
                  <div className="grid grid-cols-2 grid-rows-2 h-full overflow-hidden">
                    <div className="bg-slate-200" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-300" />
                    <div className="bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesToDisplay.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {categoriesToDisplay.map((cat, i) => (
                <Link
                  key={i}
                  to={`/market?cat=${cat.categoryKey}`}
                  className="group"
                >
                  <Card className="group relative h-[240px] md:h-[280px] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-[var(--border)] hover:border-[var(--primary)]/30">
                    <CardContent className="p-0 h-full">
                      {/* 2x2 Mosaic Image Grid */}
                      <div className="grid grid-cols-2 grid-rows-2 h-full overflow-hidden bg-[var(--secondary)]">
                        {(() => {
                          // Ensure 4 image slots for 2x2 grid
                          const images = cat.mosaicImages || [];
                          const paddedImages = Array(4).fill(null).map((_, idx) => images[idx] || '');

                          return paddedImages.map((img, idx) => (
                            <div key={idx} className="relative overflow-hidden bg-[var(--secondary)]">
                              {img ? (
                                <img
                                  src={img}
                                  alt={`${cat.name} ${idx + 1}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (!e.target.parentNode.querySelector('.fallback')) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'fallback w-full h-full bg-[var(--secondary)] flex items-center justify-center';
                                      fallback.innerHTML = '<div class="text-[var(--muted-foreground)] text-2xl">🌾</div>';
                                      e.target.parentNode.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
                                  <div className="text-[var(--muted-foreground)] text-2xl">🌾</div>
                                </div>
                              )}
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                        <span className="text-white font-semibold text-sm cursor-pointer relative group/link">
                          Shop Now
                          <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover/link:w-full"></span>
                        </span>
                      </div>

                      {/* Category Name at Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
                        <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800">No categories found</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">Check back later for fresh categories!</p>
            </div>
          )}

        </div>
      </section>

      {/* ── Showcase: Products Grid ── */}
      <section className="pt-0 pb-16 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-[var(--primary)] uppercase mb-2">
                <Package className="w-3.5 h-3.5" />
                OUR MARKETPLACE
              </div>
              <h2 className="text-2xl md:text-3.5xl font-black text-[var(--foreground)] tracking-tight">Fresh Farmer Offerings</h2>
              <p className="text-[var(--muted-foreground)] mt-2 text-xs md:text-sm font-medium">Buy directly from local farms. Middleman-free transactions.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 mt-5 md:mt-0 bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)] self-start md:self-auto shadow-sm">
              {['All', 'Organic', 'Discounted', 'Top Rated'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Skeletal State */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3 space-y-3 animate-pulse">
                  <div className="bg-slate-200 h-24 rounded-xl w-full" />
                  <div className="space-y-2">
                    <div className="bg-slate-200 h-3 rounded w-2/3" />
                    <div className="bg-slate-200 h-2 rounded w-1/2" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="bg-slate-200 h-4 rounded w-1/3" />
                    <div className="bg-slate-200 h-6 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isFavorite={isFavorite(String(prod.id))}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800">No products found</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">We couldn't find any products in this view. Try toggling the product tabs or searching for fresh products in the marketplace.</p>
              <Link to="/market" className="mt-5 inline-flex items-center gap-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md">
                Browse Marketplace
              </Link>
            </div>
          )}

        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Home;

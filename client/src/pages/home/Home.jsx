import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Search, Heart, Star,
  ShoppingCart, MapPin, Sprout, Users, Truck,
  Shield, Leaf, Package, Menu, X, ChevronDown
} from 'lucide-react';

const fmt = (n) => Number(n).toFixed(2);
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));
// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, isFavorite, onToggleFavorite, onAddToCart, className = '' }) => {
  const {
    id, name, price, rating = 4.5, vendor = 'Fresh Vendor', vendorVerified = true,
    image, reviewsCount = 120, discountPercent = 0, unit = 'kg', badge, freeShipping,
    description,
  } = product;

  return (
    <div className={`group bg-white rounded-2xl border border-slate-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: '220px' }}>
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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
              {discountPercent}% OFF
            </span>
          )}
          {badge && (
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-lg shadow-md">
              {badge}
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleFavorite(id); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
        >
          <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 mt-1 leading-snug">
          {name}
        </h3>

        {description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center mt-3 gap-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <span className="text-xs text-slate-400">({reviewsCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-emerald-700">{fmt(price)} ETB</span>
          {discountPercent > 0 && (
            <span className="text-sm text-slate-400 line-through">{calcOriginal(price, discountPercent)} ETB</span>
          )}
          <span className="text-xs text-slate-400">/ {unit}</span>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('=== Fetching Products from Home Page ===');
        const response = await fetch('http://localhost:5000/api/projects');
        const data = await response.json();
        console.log('Products received:', data);
        console.log('Products count:', Array.isArray(data) ? data.length : 0);

        // Map API response to ProductCard format
        const mappedProducts = Array.isArray(data) ? data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          unit: product.unit,
          discountPercent: product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0,
          vendor: product.farmer?.name || 'Unknown Farmer',
          vendorVerified: true,
          rating: 4.5,
          reviewsCount: Math.floor(Math.random() * 100) + 10,
          badge: product.isOrganic ? 'Organic' : null,
          freeShipping: false,
          category: product.category,
          stock: product.stock
        })) : [];

        console.log('Mapped products:', mappedProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch products on mount
    fetchProducts();

    // Listen for product addition events
    const handleProductUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('product-added', handleProductUpdate);

    return () => {
      window.removeEventListener('product-added', handleProductUpdate);
    };
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    const updateFavorites = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };
    window.addEventListener('storage', updateFavorites);
    window.addEventListener('favoritesUpdated', updateFavorites);
    return () => {
      window.removeEventListener('storage', updateFavorites);
      window.removeEventListener('favoritesUpdated', updateFavorites);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const locations = [
    { name: 'Addis Ababa', code: 'AA' },
    { name: 'Gondar', code: 'GD' },
    { name: 'Hawassa', code: 'HS' },
    { name: 'Mekelle', code: 'MK' },
    { name: 'Bahir Dar', code: 'BD' },
    { name: 'Dire Dawa', code: 'DD' },
  ];

  const categories = [
    {
      name: 'Legumes & Pulses',
      count: 48,
      icon: '🫘',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&q=80',
      categoryKey: 'legumes',
      mosaicImages: [
        'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=1400&q=80',
        'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=300&q=80',
        'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=300&q=80',
        'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=1400&q=80',
      ]
    },
    {
      name: 'Vegetables',
      count: 110,
      icon: '🥦',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
      categoryKey: 'vegetable',
      mosaicImages: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80',
        'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&q=80',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80'
      ]
    },
    {
      name: 'Fruits',
      count: 85,
      icon: '🍎',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
      categoryKey: 'fruit',
      mosaicImages: [
        
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80',
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&q=80',
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&q=80',
        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80'
      ]
    },
    {
      name: 'Coffee',
      count: 15,
      icon: '☕',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
      categoryKey: 'coffee',
      mosaicImages: [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80'
      ]
    },
    {
      name: 'Grains & Cereals',
      count: 62,
      icon: '🌾',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
      categoryKey: 'grains',
      mosaicImages: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80'
      ]
    },
    {
      name: 'Nuts & Seeds',
      count: 34,
      icon: '🌰',
      image: 'https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?w=600&q=80',
      categoryKey: 'nuts',
      mosaicImages: [
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80',
        'https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?w=300&q=80',
        'https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?w=300&q=80',
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80'
      ]
    },
    {
      name: 'Herbs & Spices',
      count: 28,
      icon: '🌿',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80',
      categoryKey: 'herbs',
      mosaicImages: [
        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80'
      ]
    },
    {
      name: 'Livestock',
      count: 12,
      icon: '🐄',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80',
      categoryKey: 'livestock',
      mosaicImages: [
        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&q=80',
        'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80',
        'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80',
        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&q=80'
      ]
    },
  ];

  // Group products by category and calculate counts
  const categoryData = categories.map(cat => {
    const categoryProducts = products.filter(p => 
      p.category && p.category.toLowerCase() === cat.name.toLowerCase()
    );
    const mosaicImages = categoryProducts.slice(0, 4).map(p => p.image || cat.mosaicImages[0]);
    
    return {
      ...cat,
      count: categoryProducts.length || cat.count,
      mosaicImages: mosaicImages.length >= 4 ? mosaicImages : cat.mosaicImages
    };
  });

  const slides = [
    {
      id: 1,
      title: 'Premium Organic Produce',
      subtitle: 'Certified organic vegetables and fruits grown with care by local farmers. Connecting local growers directly to your table.',
      ctaPrimary: 'Shop Organic',
      ctaSecondary: 'Learn More',
      tag: '100% ORGANIC',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&q=80'
    },
    {
      id: 2,
      title: 'Farm Fresh Fruits & Vegetables',
      subtitle: 'Direct from local farms to your doorstep. Guaranteed freshness with 100% middleman-free trade.',
      ctaPrimary: 'Shop Fresh Harvest',
      ctaSecondary: 'Explore Organic Farms',
      tag: 'FARM TO TABLE',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&q=80'
    },
    {
      id: 3,
      title: 'Freshly Harvested Grains',
      subtitle: 'Premium quality grains and cereals sourced directly from Ethiopian farmers.',
      ctaPrimary: 'Browse Grains',
      ctaSecondary: 'View All',
      tag: 'PURE QUALITY',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80'
    },
  ];

  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id);
    const newFavorites = isFav ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    toast[isFav ? 'error' : 'success'](isFav ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, _id: product.id });
    toast.success(`${product.name} added to cart!`);
  };

  const handleDashboardRedirect = () => {
    const routes = { customer: '/customer/dashboard', farmer: '/farmer/dashboard', admin: '/admin/dashboard' };
    if (user?.role) navigate(routes[user.role] || '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top Notification Bar ── */}
      <div className="bg-amber-400 text-amber-900 text-center py-2 text-sm font-semibold">
        ⚡ Free shipping on orders over 1000 ETB!
      </div>

      {/* ── Main Navigation Bar ── */}
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-emerald-700 tracking-tight">FarmConnect</span>
            </Link>

            {/* Location Selector */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500">Deliver to</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedLocation}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
              </button>
              {locationOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-64 py-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.code}
                      onClick={() => { setSelectedLocation(loc.name); setLocationOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{loc.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Search Bar */}
            <div className="flex-1 hidden md:block">
              <div className="flex rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-emerald-500 transition-colors shadow-sm">
                <input
                  type="text"
                  placeholder="Search fresh vegetables, organic fruits, cereals..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-slate-900 focus:outline-none bg-white"
                />
                <button className="px-6 bg-emerald-600 hover:bg-emerald-700 transition-colors">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
              {/* Account */}
              {user ? (
                <div className="relative group">
                  <button className="hidden sm:flex flex-col items-start text-slate-700 hover:text-emerald-600 transition-colors">
                    <span className="text-[10px] text-slate-400">Hello, {user.name || 'User'}</span>
                    <span className="text-xs font-semibold flex items-center gap-0.5">Account <ChevronDown className="w-3 h-3" /></span>
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={handleDashboardRedirect}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-t-xl"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors border border-slate-300 hover:border-emerald-500 px-4 py-2 rounded-xl"
                >
                  Sign In
                </button>
              )}

              {/* Favorites */}
              <Link
                to="/favorites"
                className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors relative"
              >
                <div className="relative">
                  <Heart className="w-5 h-5" />
                  {favorites.filter(f => !String(f).startsWith('cat-')).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {favorites.filter(f => !String(f).startsWith('cat-')).length}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">Favorites</span>
              </Link>

              {/* Cart */}
              <Link to="/customer/cart" className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors relative">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">Cart</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 px-4 py-4 bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-slate-900 focus:outline-none bg-white"
                />
                <button className="px-4 bg-emerald-600">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
              <button
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800">{selectedLocation}</span>
              </button>
              {user ? (
                <>
                  <button onClick={handleDashboardRedirect} className="text-left px-4 py-2 text-slate-700 hover:text-emerald-600">
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="text-left px-4 py-2 text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="text-left px-4 py-2 text-slate-700 hover:text-emerald-600">
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Container-Bounded Hero Banner (Centered & Clean with Auto-play) ── */}
      <section className="bg-slate-50 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full min-h-[440px] md:min-h-[480px] rounded-3xl overflow-hidden flex items-center justify-center text-center p-8 md:p-16">
            
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                {/* Background Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/50" />
                
                {/* Centered Content */}
                <div className="relative z-10 max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center h-full">
                  <span className="inline-block bg-amber-400 text-emerald-900 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    {slide.tag}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-white/95 text-sm md:text-base max-w-lg mx-auto leading-relaxed drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <div className="flex gap-4 flex-wrap justify-center">
                    <button className="px-8 py-3.5 bg-amber-400 text-emerald-900 font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm md:text-base shadow-lg">
                      Shop Fresh Harvest
                    </button>
                    <button className="px-8 py-3.5 bg-white/10 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm md:text-base backdrop-blur-sm shadow-lg">
                      Explore Organic Farms
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30">
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
            <button onClick={() => setCurrentSlide(s => (s + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all z-30">
              <ChevronRight className="w-6 h-6 text-slate-800" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Premium Category Showcase ── */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800">Shop by Category</h2>
            <p className="text-slate-500 mt-2">Browse fresh produce curated directly from certified local farmlands.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryData.map((cat, i) => (
              <div
                key={i}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white"
              >
                {/* 2x2 Mosaic Image Grid */}
                <Link to={`/products?category=${cat.categoryKey}`} className="block">
                  <div className="grid grid-cols-2 grid-rows-2 h-56">
                    {cat.mosaicImages.map((img, idx) => (
                      <div key={idx} className="relative overflow-hidden">
                        <img
                          src={img}
                          alt={`${cat.name} ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </Link>

                {/* Card Footer */}
                <div className="p-5 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{cat.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{cat.count} Items</p>
                  </div>
                  <Link
                    to={`/products?category=${cat.categoryKey}`}
                    className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:text-emerald-700 transition-colors"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-white mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              </div>
              <span className="text-lg font-extrabold">FarmConnect</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">The largest multi-vendor marketplace for farm-fresh produce in Ethiopia.</p>
          </div>

          {[
            { title: 'Marketplace', links: ['Browse Products', 'New Arrivals', 'Top Vendors', 'Categories'] },
            { title: 'For Vendors',  links: ['Start Selling', 'Vendor Dashboard', 'Pricing', 'Analytics'] },
            { title: 'Support',      links: ['Help Center', 'Track Order', 'Returns', 'FAQ'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-bold mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">&copy; 2026 FarmConnect, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
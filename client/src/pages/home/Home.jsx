import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';

import api from '../../api';
import { useCachedProducts, useLiveProductsPriceStock } from '../../hooks/useProducts';
import logo from '../../assets/logo.jpg';
import {
  ChevronLeft, ChevronRight, Search, Heart, Star,
  ShoppingCart, MapPin, Sprout, Users, Truck,
  Shield, Package, Menu, X, ChevronDown, CheckCircle,
  Sparkles, LogOut, LayoutDashboard, User, Sun, Moon, Monitor, MoreVertical, Settings
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
              {hasDiscount && (customDiscountBadge || true) && (
                <Badge className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-600 text-white">
                  {customDiscountBadge || 'SALE'}
                </Badge>
              )}
              {isOrganic && (
                <Badge variant="secondary" className="text-[8px] font-extrabold px-2 py-0.5 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Organic
                </Badge>
              )}
              {/* Show other non-discount badges */}
              {badges.filter(b => 
                !(b.toLowerCase().includes('sale') || 
                  b.toLowerCase().includes('discount') || 
                  b.toLowerCase().includes('off'))
              ).map((badge, idx) => (
                <Badge key={idx} variant="secondary" className="text-[8px] font-extrabold px-2 py-0.5">
                  {badge}
                </Badge>
              ))}
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

// ─── CAROUSEL SLIDES DATA ───────────────────────────────────────────────────
const farmerSlides = [
  {
    id: 1,
    bgImage: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1920&q=80',
    tag: 'HEALTHY & DELICIOUS',
    title: 'Colorful Fruits',
    story: 'Indulge in nature\'s sweetest treats! Our fresh fruits are sourced daily from trusted growers, ensuring you get the juiciest, most flavorful selection all year round.',
    productName: 'Seasonal Fruit Basket',
    productPrice: '50.00',
    productUnit: 'basket',
    productImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
    categoryKey: 'fruits',
    rating: '4.8',
    badge: 'Fresh Daily'
  },
  {
    id: 2,
    bgImage: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=1920&q=80',
    tag: 'WHOLE GRAINS',
    title: 'Nutritious Grains',
    story: 'Stock your pantry with our premium selection of whole grains, pulses, and cereals. From teff to quinoa, we have everything you need for healthy, delicious meals.',
    productName: 'Organic Teff Grain',
    productPrice: '40.00',
    productUnit: 'kg',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
    categoryKey: 'grains',
    rating: '4.7',
    badge: 'Gluten Free'
  },
  {
    id: 3,
    bgImage: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=1920&q=80',
    tag: 'HERBS & SPICES',
    title: 'Ethiopian Spices',
    story: 'Discover the authentic flavors of Ethiopia! Our traditional spice blends and ingredients are sourced from local markets, bringing vibrant colors and rich aromas to your cooking.',
    productName: 'Berbere Spice Mix',
    productPrice: '45.00',
    productUnit: 'kg',
    productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80',
    categoryKey: 'herbs',
    rating: '5.0',
    badge: 'Premium Quality'
  },
  {
    id: 4,
    bgImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80',
    tag: 'HERBS & SPICES',
    title: 'Fresh Herbs & Spices',
    story: 'Elevate your cooking with aromatic herbs and spices sourced directly from local farms.',
    categoryKey: 'herbs'
  },
  {
    id: 5,
    bgImage: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=1920&q=80',
    tag: 'FRESH FRUITS',
    title: 'Crisp Fresh Apples',
    story: 'Enjoy crisp, juicy apples straight from local orchards. Perfect for snacking, baking, or making fresh juice and desserts.',
    categoryKey: 'fruits'
  }
];


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Home = () => {
  const { theme, setTheme } = useTheme();

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
      root.style.setProperty('--primary', '#059669'); // Emerald green
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', 'oklch(0.35 0 0)');
      root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--muted', 'oklch(0.35 0 0)');
      root.style.setProperty('--muted-foreground', 'oklch(0.8 0 0)');
      root.style.setProperty('--accent', 'oklch(0.35 0 0)');
      root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
      root.style.setProperty('--border', 'transparent');
      root.style.setProperty('--input', 'oklch(1 0 0 / 25%)');
      root.style.setProperty('--ring', '#059669'); // Emerald green
      root.style.setProperty('--sidebar', 'oklch(0.30 0 0)');
      root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
      root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
      root.style.setProperty('--sidebar-accent', 'oklch(0.35 0 0)');
      root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--sidebar-border', 'transparent');
      root.style.setProperty('--sidebar-ring', '#059669'); // Emerald green
    } else if (theme === 'light') {
      // Light theme colors
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#000000');
      root.style.setProperty('--popover', '#ffffff');
      root.style.setProperty('--popover-foreground', '#000000');
      root.style.setProperty('--primary', '#059669'); // Emerald green
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
      root.style.setProperty('--ring', '#059669'); // Emerald green
      root.style.setProperty('--sidebar', '#ffffff');
      root.style.setProperty('--sidebar-foreground', '#000000');
      root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
      root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
      root.style.setProperty('--sidebar-accent', '#f3f4f6');
      root.style.setProperty('--sidebar-accent-foreground', '#000000');
      root.style.setProperty('--sidebar-border', '#e5e7eb');
      root.style.setProperty('--sidebar-ring', '#059669'); // Emerald green
    } else {
      // For system mode, use original bright oklch colors
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

      // Apply original oklch colors based on system preference
      if (systemTheme === 'dark') {
        // Original dark oklch colors
        root.style.setProperty('--background', 'oklch(0.145 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--card', 'oklch(0.205 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--popover', 'oklch(0.205 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--primary', '#059669'); // Emerald green
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.269 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--muted', 'oklch(0.269 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.708 0 0)');
        root.style.setProperty('--accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
        root.style.setProperty('--border', 'transparent');
        root.style.setProperty('--input', 'oklch(1 0 0 / 15%)');
        root.style.setProperty('--ring', '#059669'); // Emerald green
        root.style.setProperty('--sidebar', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'transparent');
        root.style.setProperty('--sidebar-ring', '#059669'); // Emerald green
      } else {
        // Original light oklch colors
        root.style.setProperty('--background', 'oklch(1 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--card', 'oklch(1 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--popover', 'oklch(1 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--primary', '#059669'); // Emerald green
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
        root.style.setProperty('--ring', '#059669'); // Emerald green
        root.style.setProperty('--sidebar', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(0.922 0 0)');
        root.style.setProperty('--sidebar-ring', '#059669'); // Emerald green
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll handler for header state
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const [currentSlide, setCurrentSlide] = useState(0);
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

  // Slideshow interval for smooth transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % farmerSlides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, []);

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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'bg-slate-900 shadow-md' : 'bg-white shadow-md border-b border-gray-200') : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Logo - icon only on mobile, full brand on desktop */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 hover:rotate-6 transition-transform overflow-hidden">
                <img src={logo} alt="FarmConnect" className="w-full h-full object-cover" />
              </div>
              {/* Hidden on mobile, visible on desktop */}
              <div className="hidden sm:flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight leading-none text-emerald-600">FarmConnect</span>
                <span className={`text-[10px] font-semibold tracking-wider transition-colors duration-300 ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>DIRECT FROM SOIL</span>
              </div>
            </Link>

            {/* Search Bar - hidden on mobile, visible on desktop */}
            <div className="flex-1 max-w-md sm:max-w-lg lg:max-w-xl hidden sm:flex justify-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className={`flex items-center w-full rounded-full border-2 transition-all duration-300 overflow-hidden backdrop-blur-xl ${isScrolled ? 'bg-white border-gray-300 dark:border-gray-600 focus-within:border-emerald-600' : 'bg-black/20 border-gray-600 dark:border-gray-600 focus-within:border-emerald-500'}`}
              >
                <Search className={`w-4 h-4 ml-3 transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white/80'}`} />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm font-medium focus:outline-none bg-transparent transition-colors duration-300 ${isScrolled ? 'text-gray-900 placeholder:text-gray-500' : 'text-white placeholder:text-white/70'}`}
                />
                <button type="submit" className="p-1.5 bg-emerald-600 hover:bg-emerald-700 transition-colors mr-1.5 my-1.5 rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

              {/* Theme Toggle - visible on both mobile and desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${isScrolled ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'hover:bg-slate-800 text-white' : 'hover:bg-gray-100 text-gray-900') : 'hover:bg-white/20 text-white'}`}>
                    {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
                  <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                    <Sun className="w-4 h-4 mr-2" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                    <Moon className="w-4 h-4 mr-2" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                    <Monitor className="w-4 h-4 mr-2" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist - hidden on mobile, visible on desktop */}
              <Link
                to="/favorites"
                className={`hidden sm:flex items-center justify-center w-10 h-10 rounded-xl relative transition-all duration-300 ${isScrolled ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'hover:bg-slate-800' : 'hover:bg-gray-100') : 'hover:bg-white/20'}`}
              >
                <Heart className={`w-6 h-6 transition-colors duration-300 ${isScrolled ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'text-white hover:text-emerald-400' : 'text-gray-900 hover:text-emerald-500') : 'text-white hover:text-emerald-300'}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Profile - hidden on mobile, visible on desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 ${isScrolled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/20 hover:bg-white/30'}`} aria-label="Profile menu">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="min-w-[180px] p-1.5 bg-[var(--card)] border-[var(--border)]">
                    <DropdownMenuItem onClick={() => navigate('/customer/profile')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/dashboard/orders')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Package className="w-4 h-4 mr-2" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/dashboard/reviews')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Star className="w-4 h-4 mr-2" /> My Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/settings')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center justify-start cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className={`hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ${isScrolled ? (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200') : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}

              {/* Cart - visible on both mobile and desktop */}
              <Link
                to="/customer/cart"
                className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold transition-all relative bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-emerald-600 text-[10px] font-black rounded-full min-w-5 h-5 flex items-center justify-center px-1 border border-emerald-600">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger - visible only on mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`sm:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ${isScrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/20 text-white'}`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`md:hidden fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-[var(--card)] z-50 shadow-2xl transform transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  {user ? (
                    <>
                      <p className="text-sm font-bold text-[var(--foreground)] line-clamp-1">
                        {user.name || user.email}
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                        {user.role}
                      </p>
                    </>
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
                  <Link
                    to="/customer/dashboard/reviews"
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname.startsWith('/customer/dashboard/reviews')
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Star className="w-5 h-5" />
                    My Reviews
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
                    onClick={handleLogout}
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
                  <Link
                    to="/favorites"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    Favorites
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
      </header>

      {/* ── Beautiful Hero Carousel Section ── */}
      <section className="relative overflow-hidden bg-[var(--card)] h-screen w-full">

        {/* Slides Content */}
        {farmerSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'opacity-100 z-10 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              {/* Beautiful Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.bgImage}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-all duration-[7000ms] ease-in-out ${isActive ? 'scale-115 brightness-105 animate-hero-pan' : 'scale-100 brightness-90'}`}
                />
                {/* Natural video-like motion overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_transparent_24%)] opacity-90 z-20 animate-hero-glow pointer-events-none" />
                <div className="absolute left-8 top-20 w-36 h-36 rounded-full bg-emerald-400/15 blur-3xl opacity-60 z-20 animate-hero-floating pointer-events-none" />
                <div className="absolute right-14 bottom-28 w-24 h-24 rounded-full border border-white/15 opacity-70 z-20 animate-hero-floating pointer-events-none" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-x-0 top-0 h-0.5 bg-white/15 opacity-0 z-20 animate-hero-scan pointer-events-none" />
                {/* Subtle animated overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-emerald-600/10 z-10 animate-pulse" style={{ animationDuration: '4s' }} />
              </div>

              {/* Centered Content Container */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center">

                {/* Main Content */}
                <div className="max-w-3xl space-y-6 md:space-y-7 text-left mt-12 md:mt-0">
                  <div className={`inline-flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-white text-[11px] md:text-xs font-bold tracking-widest uppercase rounded-full shadow-2xl transition-all duration-800 delay-200 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                    <Sparkles className="w-4 h-4" />
                    {slide.tag}
                  </div>

                  <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-tight transition-all duration-800 delay-400 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {slide.title}
                  </h1>

                  <p className={`text-white/85 text-sm md:text-base lg:text-lg font-medium leading-relaxed max-w-xl transition-all duration-800 delay-600 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    {slide.story}
                  </p>

                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((s) => (s - 1 + farmerSlides.length) % farmerSlides.length)}
          className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white shadow-2xl border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-30"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        <button
          onClick={() => setCurrentSlide((s) => (s + 1) % farmerSlides.length)}
          className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white shadow-2xl border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-30"
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
          {farmerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-3 rounded-full transition-all duration-400 ${i === currentSlide ? 'bg-[var(--primary)] w-12 shadow-lg shadow-emerald-500/50' : 'bg-white/30 w-3 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ── Showcase: Shop by Category ── */}
      <section className="pt-16 pb-0 bg-[var(--card)]">
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

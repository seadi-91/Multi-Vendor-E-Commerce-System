import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import api from '../../api';
import {
  ChevronLeft, ChevronRight, Search, Heart, Star,
  ShoppingCart, MapPin, Sprout, Users, Truck,
  Shield, Leaf, Package, Menu, X, ChevronDown, CheckCircle,
  Sparkles, LogOut, LayoutDashboard, User, Sun, Moon, Monitor, MoreVertical, Settings
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

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
    <Link to={`/product/${id}`} className="block">
      <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border-[var(--border)] ${className}`}>
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative w-full overflow-hidden bg-[var(--secondary)]" style={{ height: '120px' }}>
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = '#f0fdf4';
              }}
            />

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {discountPercent > 0 && (
                <Badge variant="destructive" className="text-[8px] font-extrabold px-2 py-0.5">
                  {discountPercent}% OFF
                </Badge>
              )}
              {badge && (
                <Badge variant="secondary" className="text-[8px] font-extrabold px-2 py-0.5 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> {badge}
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(id); }}
              className="absolute top-2 right-2 w-7 h-7 bg-[var(--card)]/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10 border border-[var(--border)]"
            >
              <Heart className={`w-3 h-3 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[var(--muted-foreground)]'}`} />
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
              className="h-6 px-2 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            >
              <ShoppingCart className="w-3 h-3" />
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
    tag: 'PREMIUM COFFEE',
    title: 'Ethiopian Coffee',
    story: 'Experience the birthplace of coffee! Our single-origin Ethiopian coffees are carefully roasted to perfection, bringing out unique flavors and rich aromas.',
    productName: 'Yirgacheffe Coffee',
    productPrice: '75.00',
    productUnit: 'kg',
    productImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80',
    categoryKey: 'coffee',
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
    tag: 'NUTS & SEEDS',
    title: 'Premium Nuts & Seeds',
    story: 'Discover our selection of fresh, premium nuts and seeds perfect for snacking and baking.',
    categoryKey: 'nuts'
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
      root.style.setProperty('--border', 'oklch(1 0 0 / 20%)');
      root.style.setProperty('--input', 'oklch(1 0 0 / 25%)');
      root.style.setProperty('--ring', '#059669'); // Emerald green
      root.style.setProperty('--sidebar', 'oklch(0.30 0 0)');
      root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
      root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
      root.style.setProperty('--sidebar-accent', 'oklch(0.35 0 0)');
      root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 20%)');
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
        root.style.setProperty('--border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--input', 'oklch(1 0 0 / 15%)');
        root.style.setProperty('--ring', '#059669'); // Emerald green
        root.style.setProperty('--sidebar', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 10%)');
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

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const { user, logout } = useAuth();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products', { params: { limit: 8 } });
        const data = response.data?.data || [];

        const mappedProducts = Array.isArray(data) ? data.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          unit: product.unit,
          discountPercent: product.discountPercent || 0,
          vendor: product.vendor || product.farmer?.name || 'Fresh Vendor',
          vendorVerified: product.vendorVerified || true,
          rating: product.rating || 4.5,
          reviewsCount: product.reviewsCount || 120,
          badge: product.isOrganic ? 'Organic' : null,
          freeShipping: false,
          category: product.category,
          stock: product.stock
        })) : [];

        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        toast.error('Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const handleProductUpdate = () => {
      fetchProducts();
    };

    window.addEventListener('product-added', handleProductUpdate);
    return () => {
      window.removeEventListener('product-added', handleProductUpdate);
    };
  }, []);

  // Sync Favorites
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

  const categories = [
    {
      name: 'Legumes & Pulses',
      icon: '🫘',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&q=80',
      categoryKey: 'legumes',
      mosaicImages: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80',
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80',
        'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=1400&q=80',
      ]
    },
    {
      name: 'Vegetables',
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
      icon: '☕',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80',
      categoryKey: 'coffee',
      mosaicImages: [
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
        'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&q=80',
        'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&amp;q=80'
      ]
    },


  ];

  const categoryData = categories.map(cat => {
    const categoryProducts = products.filter(p =>
      p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
    );
    const mosaicImages = categoryProducts.slice(0, 4).map(p => p.image || cat.mosaicImages[0]);

    return {
      ...cat,
      count: categoryProducts.length || Math.floor(Math.random() * 20) + 12,
      mosaicImages: mosaicImages.length >= 4 ? mosaicImages : cat.mosaicImages
    };
  });

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
    if (activeTab === 'Organic') return p.badge?.toLowerCase() === 'organic' || p.badge === 'Organic';
    if (activeTab === 'Discounted') return p.discountPercent > 0;
    if (activeTab === 'Top Rated') return p.rating >= 4.5;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* ── Sticky Header ── */}
      <header className="bg-[var(--card)] backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 md:gap-8">

            {/* Logo - Icon only on mobile, full on desktop */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--primary)] rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 hover:rotate-6 transition-transform">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight leading-none video-text-flow">FarmConnect</span>
                <span className="text-[9px] sm:text-[10px] text-[var(--muted-foreground)] font-semibold tracking-wider">DIRECT FROM SOIL</span>
              </div>
            </Link>

            {/* Advanced Search Bar - Hidden on mobile */}
            <div className="flex-1 max-w-xs hidden md:block">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="flex items-center bg-[var(--secondary)] rounded-xl border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:bg-[var(--secondary)] transition-all shadow-inner overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search fresh vegetables, organic grains, local products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs font-medium text-[var(--foreground)] focus:outline-none bg-transparent"
                />
                <button type="submit" className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-colors mr-1 my-1 rounded-lg">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1.5 md:gap-5 flex-shrink-0 ml-auto">
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

              {/* Favorites Wishlist - Hidden on mobile */}
              <Link
                to="/favorites"
                className="hidden md:flex items-center justify-center w-10 h-10 hover:bg-[var(--secondary)] rounded-xl relative transition-all"
              >
                <Heart className="w-5 h-5 text-[var(--foreground)] hover:text-rose-500 transition-colors" />
                {favorites.filter(f => !String(f).startsWith('cat-')).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center">
                    {favorites.filter(f => !String(f).startsWith('cat-')).length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/customer/cart"
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg sm:rounded-xl font-bold transition-all relative"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[8px] sm:text-[10px] font-black rounded-full min-w-[16px] sm:min-w-[20px] h-[16px] sm:h-[20px] flex items-center justify-center px-0.5 sm:px-1">
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

              {/* Auth actions - Hidden on mobile */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--secondary)]/70 hover:bg-[var(--secondary)] transition-all" aria-label="Profile menu">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white font-bold text-sm">
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="bottom" sideOffset={8} className="min-w-[180px] p-1.5 bg-[var(--card)] border-[var(--border)]">
                    <DropdownMenuItem onClick={() => navigate('/customer/profile')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/dashboard/orders')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/dashboard/reviews')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Star className="w-4 h-4 mr-2" />
                      My Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/customer/settings')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center justify-start cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center gap-2 rounded-xl bg-[var(--secondary)]/70 px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
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
      <section className="relative overflow-hidden bg-[var(--card)] h-[550px] md:h-[680px]">

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

                  {/* Call to Action Button */}
                  <div className={`transition-all duration-800 delay-800 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <Link
                      to={`/market?cat=${slide.categoryKey}`}
                      className="inline-flex items-center gap-3 px-9 py-5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40 active:scale-95"
                    >
                      <span>Explore Now</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
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
      <section className="py-16 bg-[var(--card)]">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {categoryData.map((cat, i) => (
              <Link
                key={i}
                to={`/market?cat=${cat.name.toLowerCase().replace(' & ', '-')}`}
                className="group"
              >
                <Card className="group relative h-[240px] md:h-[280px] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-[var(--border)] hover:border-[var(--primary)]/30">
                  <CardContent className="p-0 h-full">
                    {/* 2x2 Mosaic Image Grid */}
                    <div className="grid grid-cols-2 grid-rows-2 h-full overflow-hidden bg-[var(--secondary)]">
                      {cat.mosaicImages.map((img, idx) => (
                        <div key={idx} className="relative overflow-hidden">
                          <img
                            src={img}
                            alt={`${cat.name} ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Showcase: Products Grid ── */}
      <section className="py-16 bg-[var(--background)]">
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
                  isFavorite={favorites.includes(prod.id)}
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

      {/* ── Footer ── */}
      <footer className="bg-[var(--card)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

            {/* Column 1: Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-black tracking-tight video-text-flow">FarmConnect</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed font-medium">Enabling authentic direct trade between passionate local farmers and modern city households across Ethiopia.</p>
              <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-wider">&copy; 2026 FarmConnect Inc. All rights reserved.</p>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h5 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest mb-4">Quick Navigation</h5>
              <ul className="space-y-2.5 text-xs text-[var(--muted-foreground)] font-medium">
                <li><Link to="/market" className="hover:text-[var(--primary)] transition-colors">Marketplace Catalog</Link></li>
                <li><Link to="/favorites" className="hover:text-[var(--primary)] transition-colors">My Wishlist Favorites</Link></li>
                <li><Link to="/contact" className="hover:text-[var(--primary)] transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h5 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest mb-4">Grower Support</h5>
              <ul className="space-y-2.5 text-xs text-[var(--muted-foreground)] font-medium">
                <li><button onClick={handleDashboardRedirect} className="hover:text-[var(--primary)] transition-colors">Register as Farmer</button></li>
                <li><button onClick={handleDashboardRedirect} className="hover:text-[var(--primary)] transition-colors">Farmer Guide & Resources</button></li>
              </ul>
            </div>

            {/* Column 4: Contact details */}
            <div className="text-xs text-[var(--muted-foreground)] space-y-2">
              <h5 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest mb-4">Contact Info</h5>
              <p className="font-semibold text-[var(--foreground)]">FarmConnect HQ</p>
              <p>Email: contact@farmconnect.com</p>
              <p>Phone: +251 911 123 456</p>
              <p>Address: Addis Ababa, Ethiopia</p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;

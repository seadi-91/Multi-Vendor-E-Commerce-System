import React, { useState, useEffect, useCallback } from 'react';
import Footer from '../../../../components/Footer';
import { useCart } from '../../../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Star, Clock, Truck, Shield, Filter,
  Grid, List, ChevronRight, Search, TrendingUp,
  ShoppingCart, Heart, Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import api from '../../../../api';

// Modern Category Configuration
const CATEGORIES = [
  {
    id: 'vegetable',
    name: 'Vegetables',
    icon: '🥦',
    color: '#10b981',
    bgColor: '#d1fae5',
    popularItems: ['Tomato', 'Potato', 'Onion', 'Spinach'],
    unit: 'kg'
  },
  {
    id: 'fruit',
    name: 'Fruits',
    icon: '🍎',
    color: '#ef4444',
    bgColor: '#fee2e2',
    popularItems: ['Apple', 'Banana', 'Mango', 'Orange'],
    unit: 'kg'
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    popularItems: ['Milk', 'Cheese', 'Butter', 'Yogurt'],
    unit: 'liter'
  },
  {
    id: 'grains',
    name: 'Grains',
    icon: '🌾',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    popularItems: ['Rice', 'Wheat', 'Corn', 'Oats'],
    unit: 'kg'
  },
  {
    id: 'eggs',
    name: 'Eggs',
    icon: '🥚',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    popularItems: ['Chicken Eggs', 'Duck Eggs', 'Quail Eggs'],
    unit: 'piece'
  },
  {
    id: 'meat',
    name: 'Meat & Fish',
    icon: '🥩',
    color: '#dc2626',
    bgColor: '#fee2e2',
    popularItems: ['Chicken', 'Fish', 'Mutton', 'Beef'],
    unit: 'kg'
  },
  {
    id: 'honey',
    name: 'Honey',
    icon: '🍯',
    color: '#d97706',
    bgColor: '#fef3c7',
    popularItems: ['Wild Honey', 'Forest Honey', 'Floral Honey'],
    unit: 'kg'
  },
  {
    id: 'other',
    name: 'Others',
    icon: '📦',
    color: '#64748b',
    bgColor: '#f1f5f9',
    popularItems: ['Spices', 'Herbs', 'Processed Foods'],
    unit: 'kg'
  }
];

// Trending Searches
const TRENDING_SEARCHES = [
  'Organic Vegetables',
  'Fresh Milk',
  'Farm Eggs',
  'Seasonal Fruits',
  'Rice & Grains',
  'Fresh Chicken',
  'Pure Honey'
];

// Quick Stats Data
const QUICK_STATS = [
  { label: 'Farmers', value: '50+', icon: '👨‍🌾' },
  { label: 'Products', value: '100+', icon: '📦' },
  { label: 'Hour Delivery', value: '2-3', icon: '⚡' },
  { label: 'Cities', value: '4', icon: '🏙️' }
];

const normalizeProducts = (payload) => {
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return list.map((product) => ({
    ...product,
    id: product.id ?? product._id,
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 0,
    reviewsCount: Number(product.reviewsCount) || 0,
    discountPercent: Number(product.discountPercent) || 0,
  }));
};

const getBackendCategoryName = (categoryId) => {
  const match = CATEGORIES.find((category) => category.id === categoryId);
  return match?.name || categoryId;
};

const Home = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('vegetable');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    activeFarmers: 0,
    deliveryTime: '2-3 hours'
  });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);


  // Fetch products when selectedCategory changes
  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Automatically fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all products (no limit, no featured)
      const [productsRes, statsRes] = await Promise.allSettled([
        api.get('/products', { params: { limit: 12 } }),
        api.get('/stats')
      ]);

      // Handle products response
      if (productsRes.status === 'fulfilled') {
        setProducts(normalizeProducts(productsRes.value.data));
        setFeaturedProducts([]); // No featured in backend, skip for now
      }

      // Handle stats response
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      setProducts([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      setError(null);

      const backendCategory = getBackendCategoryName(categoryId);
      const response = await api.get('/products', {
        params: {
          category: backendCategory,
          limit: 12
        }
      });
      setProducts(normalizeProducts(response.data));
    } catch (err) {
      console.error('[DEBUG] Error fetching products for category', categoryId, err);
      setError(`Failed to load ${getCategoryInfo(categoryId).name}.`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = useCallback(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');

    if (isMobile) {
      setTimeout(() => {
        document.getElementById('products-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle add to cart (local, real-time)
  const { cart, addToCart, cartCount } = useCart();
  const handleAddToCart = (product) => {
    setAddingToCart(prev => ({ ...prev, [product._id]: true }));
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }, 500);
  };

  // Handle add to wishlist
  const handleAddToWishlist = async (productId) => {
    try {
      await api.post('/api/wishlist/add', { productId });
      console.log('Added to wishlist');
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await api.get('/users?role=customer');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setUsersError('Could not load users.');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di0yaC0ydjJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2LTJoLTJ2LTJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2aW1lZGlhdGVseTwvZz48L2c+PC9zdmc+')]"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 lg:items-center">
            <div className="flex-1 z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                Fresh from Farm to
                <span className="block"> Your Table</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
                Discover the freshest farm produce delivered directly from local farmers.
                Supporting agriculture while ensuring premium quality for your family.
              </p>

              {/* Quick Stats */}
              <div className="flex gap-4 sm:gap-6 justify-between sm:justify-start mb-8">
                {QUICK_STATS.map((stat, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-xl sm:text-2xl font-bold text-emerald-600 leading-none">{stat.value}</span>
                      <span className="text-xs text-slate-500 mt-1">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
                <div className="flex-1 relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for fresh vegetables, fruits, dairy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3.5 pl-12 pr-10 border-2 border-slate-200 rounded-xl text-[15px] bg-white transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    aria-label="Search products"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button type="submit" className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-semibold transition-colors duration-300 whitespace-nowrap flex items-center justify-center gap-2 w-full sm:w-auto" disabled={!searchQuery.trim()}>
                  <Search size={18} />
                  Search
                </button>
              </form>

              {/* Trending Searches */}
              <div className="flex items-center flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-[14px] text-slate-500 font-medium">
                  <TrendingUp size={16} /> Popular Searches:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-500 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200"
                      onClick={() => {
                        setSearchQuery(tag);
                        handleSearchSubmit({ preventDefault: () => { } });
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 relative min-h-[300px] lg:min-h-[400px]">
              <div className="relative h-full min-h-[300px] md:min-h-[350px] bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="absolute bg-white rounded-xl p-3 flex items-center gap-3 shadow-md animate-float z-10 top-[15%] left-[5%] [animation-delay:0s]">
                  <span className="text-2xl">🚜</span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 text-[14px] leading-tight">Direct from Farms</h4>
                    <p className="text-[12px] text-slate-500 leading-normal">No middlemen, better prices</p>
                  </div>
                </div>
                <div className="absolute bg-white rounded-xl p-3 flex items-center gap-3 shadow-md animate-float z-10 top-[45%] right-[5%] [animation-delay:2s]">
                  <span className="text-2xl">⚡</span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 text-[14px] leading-tight">Fast Delivery</h4>
                    <p className="text-[12px] text-slate-500 leading-normal">2-3 hours in city</p>
                  </div>
                </div>
                <div className="absolute bg-white rounded-xl p-3 flex items-center gap-3 shadow-md animate-float z-10 bottom-[15%] left-[8%] [animation-delay:4s]">
                  <span className="text-2xl">🌱</span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 text-[14px] leading-tight">100% Organic</h4>
                    <p className="text-[12px] text-slate-500 leading-normal">Certified products</p>
                  </div>
                </div>
                <div className="absolute bg-white rounded-xl p-3 flex items-center gap-3 shadow-md animate-float z-10 bottom-[30%] right-[10%] [animation-delay:3s]">
                  <span className="text-2xl">👨‍🌾</span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-slate-800 text-[14px] leading-tight">Support Farmers</h4>
                    <p className="text-[12px] text-slate-500 leading-normal">Directly to producers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-6 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm flex-shrink-0">
                <Truck size={24} />
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">Delivery</h4>
                <p className="text-sm text-slate-500">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm flex-shrink-0">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">Fast Delivery</h4>
                <p className="text-sm text-slate-500">2-3 hours in city</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white text-emerald-500 shadow-sm flex-shrink-0">
                <Shield size={24} />
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">Quality Guarantee</h4>
                <p className="text-sm text-slate-500">Freshness assured</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm text-2xl flex-shrink-0">💰</div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-slate-800 text-[15px] mb-0.5">Best Prices</h4>
                <p className="text-sm text-slate-500">Direct farm prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-slate-50" id="products-section">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
                {`${getCategoryInfo(selectedCategory).name} Products`}
              </h2>
              <p className="text-slate-500 text-[15px]">
                {`Best ${getCategoryInfo(selectedCategory).name.toLowerCase()} from local farms`}
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex border border-slate-200 bg-white rounded-lg p-0.5">
                <button
                  className={`w-10 h-10 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`w-10 h-10 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Category Filter */}
          {isMobile && (
            <div className="mb-6 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 py-2 min-w-max">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 border rounded-full text-[14px] cursor-pointer transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${selectedCategory === category.id ? 'font-semibold bg-emerald-50' : 'bg-white'}`}
                    onClick={() => handleCategorySelect(category.id)}
                    style={{
                      color: selectedCategory === category.id ? category.color : '#64748b',
                      borderColor: selectedCategory === category.id ? category.color : '#e2e8f0'
                    }}
                  >
                    <span className="tab-icon">{category.icon}</span>
                    <span className="tab-label">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error & Loading States */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg mb-6 shadow-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader className="animate-spin text-emerald-500 mb-2" size={32} />
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid/List */}
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}`}>
                {filteredProducts().length === 0 ? (
                  <div className="text-center py-16 flex flex-col items-center max-w-md mx-auto">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                    <p className="text-slate-500 mb-6">
                      {searchQuery
                        ? `No results for "${searchQuery}"`
                        : `No ${getCategoryInfo(selectedCategory).name.toLowerCase()} products available`}
                    </p>
                    <button
                      className="px-6 py-2.5 bg-white border border-slate-300 hover:border-slate-400 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                      onClick={() => {
                        setSelectedCategory('vegetable');
                        setSearchQuery('');
                      }}
                    >
                      View Vegetables
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="col-span-full text-sm text-slate-500 mb-2 font-semibold">
                      Showing {filteredProducts().length} of {products.length} products
                      {searchQuery && ` for "${searchQuery}"`}
                    </div>

                    {filteredProducts().map(product => {
                      const categoryInfo = getCategoryInfo(product.category);
                      const isAddingToCart = addingToCart[product._id];

                      return (
                        <div
                          key={product._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/customer/products?category=${product.category}`)}
                          onKeyDown={(e) => e.key === 'Enter' && navigate(`/customer/products?category=${product.category}`)}
                          className={`bg-white rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-slate-100 flex cursor-pointer ${viewMode === 'list' ? 'flex-row p-4 items-center gap-4' : 'flex-col overflow-hidden'
                            }`}
                        >
                          {/* Product Image Section */}
                          <div className={`relative ${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'w-full'}`}>
                            <div
                              className={`w-full flex items-center justify-center overflow-hidden bg-slate-50 ${viewMode === 'list' ? 'h-full rounded-lg' : 'h-48'}`}
                              style={{ backgroundColor: categoryInfo.bgColor }}
                            >
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-5xl">
                                  {categoryInfo.icon}
                                </div>
                              )}

                              {/* Product Badges */}
                              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                                {product.isOrganic && (
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm whitespace-nowrap">🌱 Organic</span>
                                )}
                                {product.discount > 0 && (
                                  <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px] font-bold shadow-sm whitespace-nowrap">-{product.discount}%</span>
                                )}
                                {product.stock < 10 && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold shadow-sm whitespace-nowrap">Low Stock</span>
                                )}
                              </div>

                              {/* Quick Actions */}
                              <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
                                <button
                                  className="w-8 h-8 rounded-full border-0 bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 cursor-pointer flex items-center justify-center transition-colors duration-200 shadow-sm"
                                  onClick={() => handleAddToWishlist(product._id)}
                                  aria-label="Add to wishlist"
                                >
                                  <Heart size={18} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'p-1' : 'p-4'}`}>
                            <div className="flex justify-between items-start mb-1.5">
                              <h3 className="font-bold text-slate-800 text-[16px] leading-tight line-clamp-1" title={product.name}>
                                {product.name}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                <span className="font-bold text-slate-700">
                                  {product.rating || 4.5}
                                </span>
                                <span>
                                  ({product.reviews || 128})
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed" title={product.description}>
                              {product.description || 'Fresh farm produce'}
                            </p>

                            {/* Product Stats */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] text-slate-500">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">Stock:</span>
                                <span className="text-slate-700 font-medium">
                                  {product.stock} {product.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400">From:</span>
                                <span className="font-semibold text-emerald-600">
                                  {product.farm || 'Local Farm'}
                                </span>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className={`flex items-center justify-between pt-3 border-t border-slate-100 mt-auto ${viewMode === 'list' ? 'w-full' : ''}`}>
                              <div className="flex flex-col">
                                <div className="text-base font-extrabold text-slate-800 flex items-baseline">
                                  <span className="text-xs font-semibold text-slate-500 mr-0.5">ETB</span>
                                  {product.price}
                                  <span className="text-[11px] font-normal text-slate-400">/{product.unit}</span>
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <div className="text-xs text-slate-400 line-through mt-0.5">
                                    ETB{product.originalPrice}
                                  </div>
                                )}
                              </div>

                              <button
                                className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => handleAddToCart(product)}
                                disabled={isAddingToCart || product.stock === 0}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                {isAddingToCart ? (
                                  <>
                                    <Loader size={12} className="animate-spin text-white" />
                                    Adding...
                                  </>
                                ) : product.stock === 0 ? (
                                  'Out of Stock'
                                ) : (
                                  <>
                                    <ShoppingCart size={14} />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* View All Button */}
              {filteredProducts().length > 0 && (
                <div className="text-center mt-12">
                  <Link
                    to={`/customer/products?category=${selectedCategory}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-500 hover:bg-emerald-500 rounded-xl text-emerald-600 hover:text-white font-bold text-sm shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    View All {getCategoryInfo(selectedCategory).name}
                    <ChevronRight size={18} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Users Section */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Our Customers</h2>
          {usersLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <span>Loading users...</span>
            </div>
          ) : usersError ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg mb-6 shadow-sm text-sm">
              <span>{usersError}</span>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-slate-500">No users found.</p>
          ) : (
            <ul className="flex flex-wrap justify-center gap-3">
              {users.map(user => (
                <li key={user._id} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors shadow-sm text-sm">
                  <span className="font-semibold text-slate-800" style={{ color: '#000' }}>{user.name}</span>
                  <span className="text-xs text-slate-400">({user.role})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
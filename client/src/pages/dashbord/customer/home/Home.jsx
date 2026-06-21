// Helper to get backend category name from id
const getBackendCategoryName = (categoryId) => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.name : categoryId;
};
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, Truck, Shield, Filter, 
  Grid, List, ChevronRight, Search, TrendingUp,
  ShoppingCart, Heart, Loader, AlertCircle, CheckCircle
} from 'lucide-react';
import './Home.scss';
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

const Home = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('vegetable');
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
        api.get('/projects'),
        api.get('/stats')
      ]);

      // Handle products response
      if (productsRes.status === 'fulfilled') {
        setProducts(Array.isArray(productsRes.value.data) ? productsRes.value.data : []);
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
      console.log('[DEBUG] Filtering categoryId:', categoryId, '| backendCategory:', backendCategory);
      const response = await api.get(`/projects?category=${encodeURIComponent(backendCategory)}&limit=12`);
      console.log('[DEBUG] API response for category', backendCategory, ':', response.data);
      setProducts(Array.isArray(response.data) ? response.data : []);
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
    <div className="customer-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Fresh from Farm to
                <span className="highlight"> Your Table</span>
              </h1>
              
              <p className="hero-subtitle">
                Discover the freshest farm produce delivered directly from local farmers. 
                Supporting agriculture while ensuring premium quality for your family.
              </p>
              
              {/* Quick Stats */}
              <div className="hero-stats">
                {QUICK_STATS.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-icon">{stat.icon}</div>
                    <div className="stat-content">
                      <span className="stat-number">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hero-search">
                <div className="search-input-wrapper">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search for fresh vegetables, fruits, dairy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    aria-label="Search products"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button type="submit" className="search-button" disabled={!searchQuery.trim()}>
                  <Search size={18} />
                  Search
                </button>
              </form>

              {/* Trending Searches */}
              <div className="trending-searches">
                <span className="trending-label">
                  <TrendingUp size={16} /> Popular Searches:
                </span>
                <div className="trending-tags">
                  {TRENDING_SEARCHES.map((tag, index) => (
                    <button
                      key={index}
                      type="button"
                      className="trending-tag"
                      onClick={() => {
                        setSearchQuery(tag);
                        handleSearchSubmit({ preventDefault: () => {} });
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hero-image">
              <div className="image-container">
                <div className="floating-card fresh">
                  <span className="card-icon">🚜</span>
                  <div className="card-content">
                    <h4>Direct from Farms</h4>
                    <p>No middlemen, better prices</p>
                  </div>
                </div>
                <div className="floating-card delivery">
                  <span className="card-icon">⚡</span>
                  <div className="card-content">
                    <h4>Fast Delivery</h4>
                    <p>2-3 hours in city</p>
                  </div>
                </div>
                <div className="floating-card organic">
                  <span className="card-icon">🌱</span>
                  <div className="card-content">
                    <h4>100% Organic</h4>
                    <p>Certified products</p>
                  </div>
                </div>
                <div className="floating-card support">
                  <span className="card-icon">👨‍🌾</span>
                  <div className="card-content">
                    <h4>Support Farmers</h4>
                    <p>Directly to producers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="features-banner">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <Truck size={24} />
              </div>
              <div className="feature-content">
                <h4>Free Delivery</h4>
                <p>On orders above ₹500</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <div className="feature-content">
                <h4>Fast Delivery</h4>
                <p>2-3 hours in city</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <div className="feature-content">
                <h4>Quality Guarantee</h4>
                <p>Freshness assured</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <div className="feature-content">
                <h4>Best Prices</h4>
                <p>Direct farm prices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/customer/products" className="view-all">
              View All Categories <ChevronRight size={16} />
            </Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map(category => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  className={`category-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                  style={{
                    '--category-color': category.color,
                    '--category-bg': category.bgColor
                  }}
                  aria-label={`Browse ${category.name}`}
                >
                  <div className="category-icon-wrapper">
                    <span className="category-icon">{category.icon}</span>
                    {isActive && (
                      <div className="active-indicator"></div>
                    )}
                  </div>
                  <div className="category-content">
                    <h3 className="category-name">{category.name}</h3>
                    <div className="category-popular">
                      {category.popularItems.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="popular-item">{item}</span>
                      ))}
                      {category.popularItems.length > 2 && (
                        <span className="more-items">+{category.popularItems.length - 2}</span>
                      )}
                    </div>
                    <div className="category-unit">
                      Sold in: <span className="unit-text">{category.unit}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section" id="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {`${getCategoryInfo(selectedCategory).name} Products`}
              </h2>
              <p className="section-subtitle">
                {`Best ${getCategoryInfo(selectedCategory).name.toLowerCase()} from local farms`}
              </p>
            </div>
            
            <div className="section-controls">
              <div className="view-toggle-group">
                <button 
                  className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button 
                  className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
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
            <div className="mobile-category-scroll">
              <div className="mobile-categories">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`mobile-category-tab ${selectedCategory === category.id ? 'active' : ''}`}
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
            <div className="alert alert-warning">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <Loader className="spinner" size={32} />
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid/List */}
              <div className={`products-container ${viewMode}`}>
                {filteredProducts().length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No products found</h3>
                    <p>
                      {searchQuery 
                        ? `No results for "${searchQuery}"` 
                        : `No ${getCategoryInfo(selectedCategory).name.toLowerCase()} products available`}
                    </p>
                    <button 
                      className="btn-secondary"
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
                    <div className="products-count">
                      Showing {filteredProducts().length} of {products.length} products
                      {searchQuery && ` for "${searchQuery}"`}
                    </div>
                    
                    {filteredProducts().map(product => {
                      const categoryInfo = getCategoryInfo(product.category);
                      const isAddingToCart = addingToCart[product._id];
                      
                      return (
                        <div key={product._id} className="product-card">
                          {/* Product Image Section */}
                          <div className="product-image-section">
                            <div 
                              className="product-image"
                              style={{ backgroundColor: categoryInfo.bgColor }}
                            >
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="image-placeholder">
                                  {categoryInfo.icon}
                                </div>
                              )}
                              
                              {/* Product Badges */}
                              <div className="product-badges">
                                {product.isOrganic && (
                                  <span className="badge organic">🌱 Organic</span>
                                )}
                                {product.discount > 0 && (
                                  <span className="badge discount">-{product.discount}%</span>
                                )}
                                {product.stock < 10 && (
                                  <span className="badge low-stock">Low Stock</span>
                                )}
                              </div>
                              
                              {/* Quick Actions */}
                              <div className="quick-actions">
                                <button 
                                  className="quick-action-btn wishlist"
                                  onClick={() => handleAddToWishlist(product._id)}
                                  aria-label="Add to wishlist"
                                >
                                  <Heart size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Product Category */}
                            <div className="product-category-tag">
                              <span 
                                className="category-tag"
                                style={{ 
                                  backgroundColor: categoryInfo.bgColor,
                                  color: categoryInfo.color
                                }}
                              >
                                {categoryInfo.name}
                              </span>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="product-info">
                            <div className="product-header">
                              <h3 className="product-name" title={product.name}>
                                {product.name}
                              </h3>
                              <div className="product-rating">
                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                <span className="rating-value">
                                  {product.rating || 4.5}
                                </span>
                                <span className="rating-count">
                                  ({product.reviews || 128})
                                </span>
                              </div>
                            </div>

                            <p className="product-description" title={product.description}>
                              {product.description?.length > 80 
                                ? `${product.description.substring(0, 80)}...` 
                                : product.description || 'Fresh farm produce'}
                            </p>

                            {/* Product Stats */}
                            <div className="product-stats">
                              <div className="stat-item">
                                <span className="stat-label">Stock:</span>
                                <span className="stat-value">
                                  {product.stock} {product.unit}
                                </span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-label">From:</span>
                                <span className="stat-value farm">
                                  {product.farm || 'Local Farm'}
                                </span>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="product-footer">
                              <div className="price-section">
                                <div className="price-current">
                                  <span className="currency">ETB</span>
                                  {product.price}
                                  <span className="price-unit">/{product.unit}</span>
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <div className="price-original">
                                    ETB{product.originalPrice}
                                  </div>
                                )}
                              </div>
                              
                              <button 
                                className={`add-to-cart-btn ${isAddingToCart ? 'loading' : ''}`}
                                onClick={() => handleAddToCart(product)}
                                disabled={isAddingToCart || product.stock === 0}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                {isAddingToCart ? (
                                  <>
                                    <Loader size={16} className="btn-spinner" />
                                    Adding...
                                  </>
                                ) : product.stock === 0 ? (
                                  'Out of Stock'
                                ) : (
                                  <>
                                    <ShoppingCart size={16} />
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
                <div className="view-all-container">
                  <Link 
                    to={`/customer/products?category=${selectedCategory}`}
                    className="view-all-btn"
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
      <section className="users-section">
        <div className="container">
          <h2 className="section-title">Our Customers</h2>
          {usersLoading ? (
            <div className="loading-container">
              <span>Loading users...</span>
            </div>
          ) : usersError ? (
            <div className="alert alert-warning">
              <span>{usersError}</span>
            </div>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul className="users-list">
              {users.map(user => (
                <li key={user._id} className="user-item">
                  <span className="user-name" style={{color: '#000 !important'}}>{user.name}</span>
                  <span className="user-role">({user.role})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose FarmFresh?</h2>
            <p className="section-subtitle">Quality you can trust, service you'll love</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚜</div>
              <h3>Direct from Farms</h3>
              <p>Eliminate middlemen, get farm-fresh products at best prices</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Super Fast Delivery</h3>
              <p>Fresh products delivered within 2-3 hours in metro cities</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌱</div>
              <h3>100% Organic</h3>
              <p>Certified organic products from trusted local farms</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Direct sourcing ensures lowest prices without compromising quality</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
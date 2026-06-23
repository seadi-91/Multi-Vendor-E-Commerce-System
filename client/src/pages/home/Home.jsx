import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Search, Heart, Star,
  ShoppingCart, Bell, ChevronDown, BadgeCheck,
  Package
} from 'lucide-react';

const fmt = (n) => Number(n).toFixed(2);
const calcOriginal = (price, discount) => fmt(price / (1 - discount / 100));

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
    {verified && <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />}
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
    <div className={`group bg-white rounded-2xl border border-neutral-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-neutral-100" style={{ height: '200px' }}>
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
          onClick={(e) => { e.preventDefault(); onToggleFavorite(id); }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-all"
        >
          <Heart className={`w-4 h-4 transition-all ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4">
        <VendorBadge name={vendor} verified={vendorVerified} />

        <h3 className="text-sm font-bold text-neutral-800 group-hover:text-emerald-700 mt-1.5 leading-snug">
          {name}
        </h3>

        {description && (
          <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center mt-2 gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} />
            ))}
          </div>
          <span className="text-[11px] text-neutral-400">({reviewsCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-extrabold text-emerald-700">${fmt(price)}</span>
          {discountPercent > 0 && (
            <span className="text-xs text-neutral-400 line-through">${calcOriginal(price, discountPercent)}</span>
          )}
          <span className="text-[10px] text-neutral-400">/ {unit}</span>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Home = () => {
  const [currentPromotion, setCurrentPromotion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

  const products = [
    { id: 1, name: 'Organic Tomatoes', description: 'Fresh organic tomatoes from local farms', price: 4.99, rating: 4.5, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', reviewsCount: 382, discountPercent: 20, unit: 'kg', freeShipping: true, badge: 'Top Pick', category: 'Vegetables' },
    { id: 2, name: 'Fresh Potatoes', description: 'Premium quality potatoes, perfect for cooking', price: 3.49, rating: 4.8, vendor: 'Valley Harvest', vendorVerified: true, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', reviewsCount: 145, discountPercent: 18, unit: 'kg', category: 'Vegetables' },
    { id: 3, name: 'Fresh Bell Peppers', description: 'Spicy and fresh peppers for your dishes', price: 5.99, rating: 4.0, vendor: 'Mountain Orchard', vendorVerified: true, image: 'https://images.unsplash.com/photo-1563565080-749774653557?w=600&q=80', reviewsCount: 612, discountPercent: 20, unit: 'kg', freeShipping: true, badge: 'Best Seller', category: 'Vegetables' },
    { id: 4, name: 'Fresh Spinach', description: 'Crisp and nutritious leafy greens', price: 2.99, rating: 4.7, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', reviewsCount: 98, discountPercent: 20, unit: 'bunch', category: 'Vegetables' },
    { id: 5, name: 'Organic Broccoli', description: 'Garden-fresh broccoli heads', price: 3.99, rating: 4.5, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80', reviewsCount: 220, discountPercent: 12, unit: 'bunch', category: 'Vegetables' },
    { id: 6, name: 'Fresh Strawberries', description: 'Sun-ripened sweet strawberries', price: 6.49, rating: 4.8, vendor: 'Berryland Farms', vendorVerified: false, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', reviewsCount: 450, discountPercent: 18, unit: 'pack', freeShipping: true, category: 'Fruits' },
    { id: 7, name: 'Organic Avocados', description: 'Creamy ripe avocados from sunny farms', price: 7.99, rating: 4.7, vendor: 'Sunny Valley', vendorVerified: true, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80', reviewsCount: 180, discountPercent: 15, unit: 'pack', badge: 'New', category: 'Fruits' },
    { id: 8, name: 'Organic Apples', description: 'Crisp and sweet apples from mountain orchards', price: 5.49, rating: 4.9, vendor: 'Mountain Orchard', vendorVerified: true, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80', reviewsCount: 612, discountPercent: 25, unit: 'kg', freeShipping: true, category: 'Fruits' },
  ];

  // Carousel data containing exactly 4 agricultural promo slides (Free delivery removed)
  const promotions = [
    { id: 1, title: 'Fresh Organic Vegetables', description: 'Get 20% off on all organic vegetables this week!', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1400&q=80', cta: 'Shop Now', tag: 'Limited Time' },
    { id: 2, title: 'Farm Fresh Fruits', description: 'Direct from farm to your doorstep. No middlemen!', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&q=80', cta: 'Explore Fruits', tag: 'Farm to Table' },
    { id: 3, title: 'Freshly Harvested Grains', description: 'Premium source grains and hand-selected staples for your kitchen.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80', cta: 'Browse Grains', tag: 'Pure Quality' },
    { id: 4, title: 'Aromatic Premium Coffee', description: 'Savor the depth of micro-lot single-origin beans straight from the source.', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1400&q=80', cta: 'View Coffee', tag: 'New Arrival' }
  ];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(f => f !== id) : [...prev, id]);
    toast[isFav ? 'error' : 'success'](isFav ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const addToCart = (product) => {
    setCartCount(p => p + 1);
    setCartTotal(p => +(p + product.price).toFixed(2));
    toast.success(`${product.name} added to cart!`);
  };

  const handleDashboardRedirect = () => {
    const routes = { customer: '/customer/dashboard', farmer: '/farmer/dashboard', admin: '/admin/dashboard' };
    if (user?.role) navigate(routes[user.role] || '/');
  };

  useEffect(() => {
    const t = setInterval(() => setCurrentPromotion(p => (p + 1) % promotions.length), 5000);
    return () => clearInterval(t);
  }, [promotions.length]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white text-gray-800 sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">

          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-emerald-600 tracking-tight">FarmConnect</span>
          </Link>

          {/* Search bar — small, centered */}
          <div className="flex-1 flex justify-center px-4">
            <div className="flex w-full max-w-md rounded-lg overflow-hidden border border-gray-300 focus-within:border-emerald-500 transition-colors shadow-sm">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm text-gray-900 focus:outline-none bg-white"
              />
              <button className="px-4 bg-emerald-600 hover:bg-emerald-700 transition-colors">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Right actions — pushed to far right */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
            {/* Account */}
            {user ? (
              <button onClick={handleDashboardRedirect} className="flex flex-col items-start text-gray-700 hover:text-emerald-600 transition-colors">
                <span className="text-[10px] text-gray-400">Hello, {user.name || 'User'}</span>
                <span className="text-xs font-semibold flex items-center gap-0.5">Account <ChevronDown className="w-3 h-3" /></span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors border border-gray-300 hover:border-emerald-500 px-3 py-1.5 rounded-lg"
              >
                Sign In
              </button>
            )}

            {/* Wishlist / Favorites */}
            <Link
              to="/customer/dashboard"
              className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 transition-colors relative"
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
            <Link to="/customer/cart" className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 transition-colors relative">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Cart{cartTotal > 0 ? ` · $${cartTotal}` : ''}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Carousel ── */}
      <section className="relative bg-black">
        <div className="relative h-[280px] md:h-[380px] overflow-hidden">
          {promotions.map((promo, i) => (
            <div
              key={promo.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === currentPromotion ? 'opacity-100' : 'opacity-0'}`}
              style={{ backgroundImage: `url(${promo.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-16 max-w-xl">
                <span className="inline-block bg-amber-400 text-amber-900 text-[10px] font-extrabold px-3 py-1 rounded-full mb-3 w-max uppercase tracking-wider">
                  {promo.tag}
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">{promo.title}</h2>
                <p className="text-sm text-white/80 mb-5">{promo.description}</p>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-amber-400 text-gray-900 font-bold rounded-lg hover:bg-amber-300 transition-colors text-sm shadow-lg">
                    {promo.cta}
                  </button>
                  <button className="px-6 py-2.5 bg-white/10 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm backdrop-blur-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {promotions.map((_, i) => (
              <button key={i} onClick={() => setCurrentPromotion(i)} className={`h-2 rounded-full transition-all ${i === currentPromotion ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
            ))}
          </div>

          <button onClick={() => setCurrentPromotion(p => (p - 1 + promotions.length) % promotions.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button onClick={() => setCurrentPromotion(p => (p + 1) % promotions.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-neutral-800 tracking-tight">Shop by Category</h2>
          <p className="text-sm text-neutral-500 mt-1">Browse fresh produce by category</p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full max-w-5xl">
            {[
              { name: 'Legumes & Pulses', sub: 'Chickpeas',    emoji: '🫘', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500&q=80',  link: '/market?cat=legumes' },
              { name: 'Vegetables',       sub: 'Tomato, Onion', emoji: '🥦', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80', link: '/market?cat=vegetables' },
              { name: 'Fruits',           sub: 'Mango, Banana', emoji: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80', link: '/market?cat=fruits' },
              { name: 'Coffee',           sub: 'Coffee Beans',  emoji: '☕', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500&q=80',  link: '/market?cat=coffee' },
              { name: 'Grains & Cereals', sub: 'Wheat, Teff',   emoji: '🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80',  link: '/market?cat=grains' },
              { name: 'Nuts & Seeds',     sub: 'Sesame, Almonds',emoji: '🌰', image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=500&q=80',  link: '/market?cat=nuts' },
              { name: 'Herbs & Spices',   sub: 'Rosemary',      emoji: '🌿', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&q=80',  link: '/market?cat=herbs' },
              { name: 'Livestock',        sub: 'Cattle',        emoji: '🐄', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500&q=80',  link: '/market?cat=livestock' },
            ].map((cat) => (
              <Link
                to={cat.link}
                key={cat.name}
                className="group flex flex-col items-center text-center cursor-pointer font-sans"
              >
                <div className="relative w-full rounded-2xl h-48 overflow-hidden mb-3 shadow-md border-2 border-neutral-100 group-hover:border-emerald-400 transition-all duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = '#f0fdf4';
                      e.target.parentNode.innerHTML = `<span style="font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%">${cat.emoji}</span>`;
                    }}
                  />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 group-hover:text-emerald-600 transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular / Featured Products ── */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-extrabold text-neutral-800">Popular Products</h2>
          <p className="text-sm text-neutral-500 mt-1">Fresh agricultural products from trusted farmers.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 flex-wrap mb-8">
          {['All', 'Vegetables', 'Fruits', 'Grains'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isFavorite={favorites.includes(p.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/market"
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md"
          >
            Browse All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-800 text-white mt-4">
        <div
          className="bg-gray-700 py-3 text-center cursor-pointer hover:bg-gray-600 text-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top ↑
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold">FarmConnect</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">The largest multi-vendor marketplace for farm-fresh produce.</p>
            <div className="flex gap-3 mt-4">
              {['𝕏', 'f', 'in', '▶'].map(icon => (
                <button key={icon} className="w-8 h-8 bg-gray-600 hover:bg-emerald-600 rounded-full text-xs font-bold transition-colors flex items-center justify-center">{icon}</button>
              ))}
            </div>
          </div>

          {[
            { title: 'Marketplace', links: ['Browse Products', 'New Arrivals', 'Top Vendors', 'Categories'] },
            { title: 'For Vendors',  links: ['Start Selling', 'Vendor Dashboard', 'Pricing', 'Analytics'] },
            { title: 'Company',      links: ['About Us', 'Careers', 'Blog', 'Investor Relations'] },
            { title: 'Support',      links: ['Help Center', 'Track Order', 'Returns', 'Contact Us'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-bold mb-3 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">&copy; 2026 FarmConnect, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
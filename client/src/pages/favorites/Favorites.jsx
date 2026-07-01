import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, Package, ChevronLeft, BadgeCheck } from 'lucide-react';
import CustomerHeader from '../dashbord/customer/header/Header';
import CustomerFooter from '../dashbord/customer/footer/Footer';

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
          <span className="text-[10px] text-neutral-400">/{unit}</span>
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

// ─── Public Header ────────────────────────────────────────────────────────────
const PublicHeader = ({ cartCount }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-white text-gray-800 sticky top-0 z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
        {/* Logo — left */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">FC</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-600 tracking-tight">FarmConnect</span>
        </Link>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
          {/* Favorites */}
          <Link
            to="/favorites"
            className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors relative"
          >
            <div className="relative">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Favorites</span>
          </Link>

          {/* Cart */}
          <Link
            to="/customer/cart"
            className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const { addToCart, cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Calculate cart total from CartContext
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  // Load favorites from localStorage on mount
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

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <CustomerHeader user={user} onLogout={logout} cartCount={cartCount} />
      ) : (
        <PublicHeader cartCount={cartCount} />
      )}

      {/* ─── Main Content ─── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-neutral-800 mb-2">My Favorites</h1>
          <p className="text-sm text-neutral-500">
            {favoriteProducts.length > 0 
              ? `You have ${favoriteProducts.length} favorite product${favoriteProducts.length !== 1 ? 's' : ''}`
              : 'You haven\'t added any products to your favorites yet.'}
          </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No favorites yet</h3>
            <p className="text-sm text-neutral-500 mb-6">Start adding products you love to your wishlist!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>

      {user ? (
        <CustomerFooter />
      ) : (
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
                  <span className="text-white font-extrabold text-xs">FC</span>
                </div>
                <span className="text-lg font-extrabold">FarmConnect</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">The largest multi-vendor marketplace for farm-fresh produce.</p>
            </div>

            {[
              { title: 'Marketplace', links: ['Browse Products', 'New Arrivals', 'Top Vendors', 'Categories'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Investor Relations'] },
              { title: 'Support', links: ['Help Center', 'Track Order', 'Returns', 'Contact Us'] },
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
      )}
    </div>
  );
};

export default Favorites;

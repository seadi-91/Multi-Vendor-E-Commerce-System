import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CustomerFooter from '../dashbord/customer/footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Package, ChevronLeft, BadgeCheck } from 'lucide-react';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ cartCount, favoritesCount, isOpen, onClose }) => {
  const baseMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 font-medium transition-all hover:bg-gray-50 hover:text-green-600 group";
  const activeMenuClass = "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all bg-green-50 text-green-600";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 p-6 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out h-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-xl">🌾</span>
                </div>
                <h1 className="text-lg font-extrabold flex items-center">
                  <span className="text-green-600">Farm</span>
                  <span className="text-gray-800">Connect</span>
                </h1>
              </Link>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-400 font-medium mb-8 pl-1">Fresh from Farm to You</p>

          {/* Core Shopping Sidebar Links */}
          <nav className="space-y-1">
            <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🏠</span> <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/market" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🥗</span> <span>Products</span>
              </div>
            </NavLink>

            <NavLink to="/customer/dashboard/orders" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛍️</span> <span>My Orders</span>
              </div>
            </NavLink>

            <NavLink to="/favorites" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🤍</span> <span>Wishlist</span>
              </div>
              {favoritesCount > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              )}
            </NavLink>

            <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span> <span>Cart</span>
              </div>
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cartCount || 0}</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Promo Card */}
        <div className="bg-green-50 rounded-2xl p-4 mt-6 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-green-800 font-bold text-base mb-1">Fresh Deals!</h3>
            <p className="text-xs text-gray-600 mb-3 max-w-[120px]">Get up to 20% off on selected products</p>
            <Link to="/" className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors">
              Shop Now
            </Link>
          </div>
          <span className="absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 pointer-events-none group-hover:scale-110 transition-transform">🧺</span>
        </div>
      </aside>
    </>
  );
};

// ─── Dashboard Header ───────────────────────────────────────────────────────
const DashboardHeader = ({ user, cartCount, onLogout, onMenuToggle, favoritesCount }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-gray-600 hover:text-green-600 mr-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Universal Search Bar */}
      <div className="flex items-center w-full max-w-xl bg-gray-50 border border-gray-200 rounded-xl overflow-hidden px-4 py-1.5 focus-within:border-green-500 transition-colors">
        <input
          type="text"
          placeholder="Search for products or sellers..."
          className="bg-transparent w-full text-sm text-gray-700 placeholder-gray-400 outline-none py-1"
        />
        <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      {/* Global Action Icons */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div onClick={() => navigate('/customer/dashboard/notifications')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
        </div>
        <div onClick={() => navigate('/favorites')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🤍</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{favoritesCount}</span>
          )}
        </div>
        <div onClick={() => navigate('/customer/cart')} className="relative cursor-pointer p-1 text-gray-600 hover:text-green-600">
          <span className="text-xl">🛒</span>
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount || 0}</span>
        </div>

        {/* User Interactive Menu Context */}
        <div className="flex items-center gap-3 border-l pl-4 sm:pl-6 border-gray-200 relative group">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"}
            alt="User profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1 cursor-default">
              Hi, {user?.name || "Selam!"}
            </p>
          </div>

          <button className="text-gray-400 hover:text-gray-700 font-bold px-1 text-xl transition-colors ml-1 focus:outline-none">
            &#8942;
          </button>

          {/* 3-Dot Dropdown Actions Panel */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">

            <button onClick={() => navigate('/customer/dashboard/notifications')} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <div className="flex items-center gap-3">
                <span>🔔</span> Notifications
              </div>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button onClick={() => navigate('/customer/dashboard/reviews')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <span>⭐</span> My Reviews
            </button>
            <button onClick={() => navigate('/customer/dashboard/settings')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 font-medium text-left">
              <span>⚙️</span> Settings
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium text-left">
              <span>📤</span> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Public Header ───────────────────────────────────────────────────────────
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
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

const Cart = () => {
  const { cart, removeFromCart, cartCount, incrementQuantity, decrementQuantity, clearCart } = useCart();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = JSON.parse(localStorage.getItem('favorites') || '[]').length;

  const handleCheckout = () => {
    if (loading) {
      // Optionally show a spinner or prevent action until auth state is resolved
      return;
    }
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/customer/checkout' } });
      return;
    }
    navigate('/customer/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader cartCount={cartCount} />
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-4 md:p-6 text-gray-800 mt-2.5 md:mt-5 mb-2.5 md:mb-5 mx-2.5 md:mx-auto">
          <div className="text-center mb-6 pb-3 border-b border-gray-100">
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Your Shopping Cart</h1>
            {cart.length > 0 && (
              <p className="text-sm text-gray-500 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-900">
              <div className="text-4xl mb-4 opacity-50">🛒</div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
              <p className="text-sm text-gray-500 mb-6">Add some delicious items to get started!</p>
              <button
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div className="flex flex-col gap-4">
                {cart.map(item => (
                  <div
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 p-4 bg-white rounded-lg border border-gray-200 relative"
                    key={item._id}
                  >
                    <div className="w-16 h-16 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mx-auto md:mx-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl bg-green-100 text-green-600">
                          🍕
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-2 text-xs">
                        {item.description || 'Delicious item waiting for you!'}
                      </p>

                      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1.5 py-0.5">
                          <button
                            className="w-6 h-6 rounded-full bg-white text-gray-900 text-sm cursor-pointer flex items-center justify-center hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                            onClick={() => decrementQuantity(item._id)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-900 min-w-[24px] text-center text-sm">{item.quantity}</span>
                          <button
                            className="w-6 h-6 rounded-full bg-white text-gray-900 text-sm cursor-pointer flex items-center justify-center hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                            onClick={() => incrementQuantity(item._id, item.stock || 99)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                          <span className="text-xs text-gray-500">{item.price} ETB</span>
                          <span className="text-sm font-extrabold text-gray-900">{item.price * item.quantity} ETB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="bg-transparent text-red-500 border-none w-7 h-7 rounded-full text-lg cursor-pointer hover:bg-red-50 transition-all flex items-center justify-center absolute top-2 right-2 md:static"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="sticky top-5">
                <div className="bg-white border border-gray-200 rounded-lg p-5 text-gray-900">
                  <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">Order Summary</h3>

                  <div className="flex justify-between mb-3 text-gray-900">
                    <span className="text-gray-500 text-xs">Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-gray-900 text-sm">{total} ETB</span>
                  </div>

                  <div className="flex justify-between mb-3 text-gray-900">
                    <span className="text-gray-500 text-xs">Delivery Fee</span>
                    <span className="font-semibold text-gray-900 text-sm">50 ETB</span>
                  </div>

                  <div className="flex justify-between mb-3 text-gray-900">
                    <span className="text-gray-500 text-xs">Tax</span>
                    <span className="font-semibold text-gray-900 text-sm">{(total * 0.15).toFixed(2)} ETB</span>
                  </div>
                  <div className="h-px bg-gray-200 my-3"></div>

                  <div className="flex justify-between items-center my-4">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-xl font-black text-green-600">
                      {(total + 50 + total * 0.15).toFixed(2)} ETB
                    </span>
                  </div>
                  <button
                    className="w-full bg-green-600 text-white border-none py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-green-700 transition-all mb-3"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    className="w-full bg-transparent text-red-500 border border-red-500 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-red-50 transition-all"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-800 antialiased font-sans">
      <div className="flex flex-1">
        <Sidebar 
          cartCount={cartCount} 
          favoritesCount={favoritesCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader 
            user={user} 
            cartCount={cartCount} 
            onLogout={logout} 
            onMenuToggle={() => setSidebarOpen(true)}
            favoritesCount={favoritesCount}
          />

          <div className="flex-1 overflow-y-auto">
            <main className="flex-1">
              <section className="px-6 py-6">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-4 md:p-6 text-gray-800">
                  <div className="text-center mb-6 pb-3 border-b border-gray-100">
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Your Shopping Cart</h1>
                    {cart.length > 0 && (
                      <p className="text-sm text-gray-500 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-900">
                      <div className="text-4xl mb-4 opacity-50">🛒</div>
                      <h2 className="text-xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
                      <p className="text-sm text-gray-500 mb-6">Add some delicious items to get started!</p>
                      <button
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all"
                        onClick={() => navigate('/')}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                      <div className="flex flex-col gap-4">
                        {cart.map(item => (
                          <div
                            className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-4 p-4 bg-white rounded-lg border border-gray-200 relative"
                            key={item._id}
                          >
                            <div className="w-16 h-16 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 mx-auto md:mx-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl bg-green-100 text-green-600">
                                  🍕
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col text-center md:text-left">
                              <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-3 mb-1">
                                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-gray-500 mb-2 text-xs">
                                {item.description || 'Delicious item waiting for you!'}
                              </p>

                              <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1.5 py-0.5">
                                  <button
                                    className="w-6 h-6 rounded-full bg-white text-gray-900 text-sm cursor-pointer flex items-center justify-center hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                                    onClick={() => decrementQuantity(item._id)}
                                    aria-label="Decrease quantity"
                                    disabled={item.quantity <= 1}
                                  >
                                    −
                                  </button>
                                  <span className="font-bold text-gray-900 min-w-[24px] text-center text-sm">{item.quantity}</span>
                                  <button
                                    className="w-6 h-6 rounded-full bg-white text-gray-900 text-sm cursor-pointer flex items-center justify-center hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                                    onClick={() => incrementQuantity(item._id, item.stock || 99)}
                                    aria-label="Increase quantity"
                                    disabled={item.quantity >= (item.stock || 99)}
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="flex flex-col items-center md:items-end">
                                  <span className="text-xs text-gray-500">{item.price} ETB</span>
                                  <span className="text-sm font-extrabold text-gray-900">{item.price * item.quantity} ETB</span>
                                </div>
                              </div>
                            </div>

                            <button
                              className="bg-transparent text-red-500 border-none w-7 h-7 rounded-full text-lg cursor-pointer hover:bg-red-50 transition-all flex items-center justify-center absolute top-2 right-2 md:static"
                              onClick={() => removeFromCart(item._id)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="sticky top-5">
                        <div className="bg-white border border-gray-200 rounded-lg p-5 text-gray-900">
                          <h3 className="text-base font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">Order Summary</h3>

                          <div className="flex justify-between mb-3 text-gray-900">
                            <span className="text-gray-500 text-xs">Subtotal ({itemCount} items)</span>
                            <span className="font-semibold text-gray-900 text-sm">{total} ETB</span>
                          </div>

                          <div className="flex justify-between mb-3 text-gray-900">
                            <span className="text-gray-500 text-xs">Delivery Fee</span>
                            <span className="font-semibold text-gray-900 text-sm">50 ETB</span>
                          </div>

                          <div className="flex justify-between mb-3 text-gray-900">
                            <span className="text-gray-500 text-xs">Tax</span>
                            <span className="font-semibold text-gray-900 text-sm">{(total * 0.15).toFixed(2)} ETB</span>
                          </div>
                          <div className="h-px bg-gray-200 my-3"></div>

                          <div className="flex justify-between items-center my-4">
                            <span className="text-sm font-bold text-gray-900">Total</span>
                            <span className="text-xl font-black text-green-600">
                              {(total + 50 + total * 0.15).toFixed(2)} ETB
                            </span>
                          </div>
                          <button
                            className="w-full bg-green-600 text-white border-none py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-green-700 transition-all mb-3"
                            onClick={handleCheckout}
                          >
                            Proceed to Checkout
                          </button>

                          <button
                            className="w-full bg-transparent text-red-500 border border-red-500 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-red-50 transition-all"
                            onClick={clearCart}
                          >
                            Clear Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default Cart;

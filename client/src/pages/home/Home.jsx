import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Search, Heart, Star, ShoppingCart } from 'lucide-react';

const Home = () => {
  const [currentPromotion, setCurrentPromotion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock data for featured products
  const featuredProducts = [
    { id: 1, name: 'Organic Tomatoes', price: 4.99, rating: 4.8, vendor: 'Green Farms', image: 'https://images.unsplash.com/photo-1546470427-227c7369a9b8?w=400' },
    { id: 2, name: 'Fresh Carrots', price: 3.49, rating: 4.6, vendor: 'Valley Harvest', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400' },
    { id: 3, name: 'Organic Apples', price: 5.99, rating: 4.9, vendor: 'Mountain Orchard', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' },
    { id: 4, name: 'Fresh Spinach', price: 2.99, rating: 4.7, vendor: 'Leafy Greens Co', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
  ];

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast.success(favorites.includes(productId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const addToCart = (product) => {
    setCartCount(prev => prev + 1);
    toast.success(`${product.name} added to cart!`);
  };

  const promotions = [
    {
      id: 1,
      title: "Fresh Organic Vegetables",
      description: "Get 20% off on all organic vegetables this week!",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Shop Now"
    },
    {
      id: 2,
      title: "Farm Fresh Fruits",
      description: "Direct from farm to your doorstep. No middlemen!",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Explore Fruits"
    },
    {
      id: 3,
      title: "Free Delivery",
      description: "Free delivery on orders above ₹500",
      image: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      cta: "Order Now"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromotion((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAuthClick = (type) => {
    if (type === 'login') {
      navigate('/login');
    } else if (type === 'register') {
      navigate('/register');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleDashboardRedirect = () => {
    if (user?.role === 'customer') {
      navigate('/customer/dashboard');
    } else if (user?.role === 'farmer') {
      navigate('/farmer/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const nextPromotion = () => {
    setCurrentPromotion((prev) => (prev + 1) % promotions.length);
  };

  const prevPromotion = () => {
    setCurrentPromotion((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Amazon-style Header */}
      <header className="bg-gray-900 text-white">
        <div className="bg-gray-800 py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <h1 className="text-xl font-bold text-white">FarmConnect</h1>
            </div>

            {/* Compact Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                placeholder="Search FarmConnect"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm text-gray-900 rounded-l-lg focus:outline-none"
              />
              <button className="absolute right-0 top-0 h-full px-3 bg-orange-400 hover:bg-orange-500 rounded-r-lg">
                <Search className="w-4 h-4 text-gray-900" />
              </button>
            </div>

            {/* Auth & Icons */}
            <div className="flex items-center space-x-4 text-sm flex-shrink-0">
              {user ? (
                <button 
                  onClick={handleDashboardRedirect}
                  className="hover:underline"
                >
                  <p className="text-gray-400 text-xs">Hello, {user.name || 'User'}</p>
                  <p className="font-semibold">Account</p>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="hover:underline"
                  >
                    <p className="text-gray-400 text-xs">Hello, Sign in</p>
                    <p className="font-semibold">Account</p>
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className="hover:underline"
                  >
                    <p className="font-semibold">Register</p>
                  </button>
                </>
              )}
              
              {/* Favorite Icon */}
              <button className="relative hover:text-yellow-400 transition-colors">
                <Heart className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button className="relative hover:text-yellow-400 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Amazon Style */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative h-[250px] md:h-[300px] overflow-hidden">
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentPromotion ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${promo.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 max-w-lg">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{promo.title}</h2>
                  <p className="text-base text-white/90 mb-3">{promo.description}</p>
                  <button className="px-5 py-2 bg-yellow-400 text-gray-900 font-semibold rounded hover:bg-yellow-500 transition-colors text-sm">
                    {promo.cta}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Carousel Controls */}
            <button 
              onClick={prevPromotion}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button 
              onClick={nextPromotion}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid - Amazon Style */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 justify-items-center">
        

          {/* Product Cards */}
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group w-full max-w-[300px]">
              <div className="relative mb-2 overflow-hidden rounded">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-1 right-1 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                </button>
                <span className="absolute bottom-1 left-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">20% OFF</span>
              </div>
              <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 h-8 mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
              <div className="flex items-center mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-orange-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">{Math.floor(Math.random() * 5000 + 100)}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-gray-900">${product.price}</p>
                <p className="text-xs text-gray-400 line-through">${(product.price * 1.2).toFixed(2)}</p>
              </div>
              <p className="text-xs text-emerald-600 font-medium mb-2">FREE delivery</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full py-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-gray-900 rounded text-xs font-semibold shadow-sm hover:shadow transition-all"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal Product Carousel - Amazon Style */}
      <section className="bg-white py-6 px-4 mb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Best Sellers in Fresh Produce</h3>
            <a href="#" className="text-sm text-blue-600 hover:underline">See more</a>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-48 bg-white p-3 shadow hover:shadow-lg transition-shadow">
                <img src={product.image} alt={product.name} className="w-full h-36 object-cover mb-2" />
                <h4 className="text-sm font-medium line-clamp-2 h-10">{product.name}</h4>
                <p className="text-sm font-bold">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Favorites Section - Amazon Style */}
      <section className="bg-white py-6 px-4 mb-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Your Wishlist</h3>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts
                .filter(product => favorites.includes(product.id))
                .map((product) => (
                  <div key={product.id} className="border p-4 hover:shadow-lg transition-shadow">
                    <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-3" />
                    <h4 className="text-sm font-medium line-clamp-2 h-10">{product.name}</h4>
                    <p className="text-lg font-bold">${product.price}</p>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full mt-2 py-2 bg-yellow-400 hover:bg-yellow-500 rounded text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50">
              <p className="text-gray-600">Your wishlist is empty</p>
              <button className="mt-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded text-sm">
                Continue shopping
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer - Amazon Style */}
      <footer className="bg-gray-800 text-white">
        {/* Back to Top */}
        <div className="bg-gray-700 py-4 text-center cursor-pointer hover:bg-gray-600">
          <p className="text-sm">Back to top</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-3">Get to Know Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">About FarmConnect</a></li>
                <li><a href="#" className="hover:underline">Investor Relations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Make Money with Us</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Sell products on FarmConnect</a></li>
                <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
                <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
                <li><a href="#" className="hover:underline">Self-Publish with Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">FarmConnect Payment</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Business Card</a></li>
                <li><a href="#" className="hover:underline">Shop with Points</a></li>
                <li><a href="#" className="hover:underline">Reload Your Balance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Let Us Help You</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Your Account</a></li>
                <li><a href="#" className="hover:underline">Your Orders</a></li>
                <li><a href="#" className="hover:underline">Shipping Rates & Policies</a></li>
                <li><a href="#" className="hover:underline">Returns & Replacements</a></li>
                <li><a href="#" className="hover:underline">Help</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <h1 className="text-xl font-bold">FarmConnect</h1>
              </div>
              <div className="flex space-x-6 text-sm text-gray-300">
                <a href="#" className="hover:underline">Conditions of Use</a>
                <a href="#" className="hover:underline">Privacy Notice</a>
                <a href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</a>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">&copy; 1996-2026, FarmConnect.com, Inc. or its affiliates</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
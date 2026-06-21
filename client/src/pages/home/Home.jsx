import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.scss';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [currentPromotion, setCurrentPromotion] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      // Here you would typically send the email to your backend
      // For now, we'll just show a success message
      setIsSubscribed(true);
      toast.success('Thank you for subscribing! 🎉');
      setNewsletterEmail('');
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  const nextPromotion = () => {
    setCurrentPromotion((prev) => (prev + 1) % promotions.length);
  };

  const prevPromotion = () => {
    setCurrentPromotion((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo">
            <h1>FarmConnect</h1>
          </div>
          
          <nav className="nav-links">
            <Link to="/" className="nav-link active">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="auth-buttons">
            {user ? (
              <>
                <button 
                  className="dashboard-btn"
                  onClick={handleDashboardRedirect}
                >
                  Dashboard
                </button>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="login-btn"
                  onClick={() => handleAuthClick('login')}
                >
                  Login
                </button>
                <button 
                  className="register-btn"
                  onClick={() => handleAuthClick('register')}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Promotions */}
      <section className="hero-section">
        <div className="promotion-slider">
          <div className="slider-container">
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                className={`promotion-slide ${index === currentPromotion ? 'active' : ''}`}
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${promo.image})`
                }}
              >
                <div className="promotion-content">
                  <h2 className="promotion-title">{promo.title}</h2>
                  <p className="promotion-description">{promo.description}</p>
                  <button className="promotion-cta">
                    {promo.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-nav prev" onClick={prevPromotion}>
            ‹
          </button>
          <button className="slider-nav next" onClick={nextPromotion}>
            ›
          </button>

          <div className="slider-dots">
            {promotions.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentPromotion ? 'active' : ''}`}
                onClick={() => setCurrentPromotion(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose FarmConnect?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh & Organic</h3>
              <p>Direct from certified organic farms</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Same day delivery in selected areas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Farm to table, no middlemen</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍🌾</div>
              <h3>Support Farmers</h3>
              <p>Directly supporting local farmers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>FarmConnect</h3>
              <p>Connecting farmers and consumers for fresh, organic produce.</p>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📧 info@farmconnect.com</p>
              <p>📞 +251 902858504</p>
              <p>📍 123 Farm Road, Agricity</p>
            </div>
            <div className="footer-section">
              <h4>Newsletter</h4>
              <p>Subscribe for fresh updates!</p>
              {isSubscribed ? (
                <div className="subscription-success">
                  <p>🎉 Thank you for subscribing!</p>
                  <p>We'll keep you updated with the latest news.</p>
                </div>
              ) : (
                <form className="newsletter" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Subscribe</button>
                </form>
              )}
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 FarmConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
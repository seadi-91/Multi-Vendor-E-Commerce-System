import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Shield, Truck, 
  CreditCard, Facebook, Twitter, Instagram, Youtube,
  MessageCircle, Heart, Leaf, Award, Users
} from 'lucide-react';
import './Footer.scss';

const CustomerFooter = () => {
  // Quick Links
  const quickLinks = {
    shop: [
      { name: 'Vegetables', path: '/customer/products?category=vegetable' },
      { name: 'Fruits', path: '/customer/products?category=fruit' },
      { name: 'Dairy Products', path: '/customer/products?category=milk' },
      { name: 'Grains & Cereals', path: '/customer/products?category=grains' },
      { name: 'Eggs', path: '/customer/products?category=eggs' },
      { name: 'Meat & Fish', path: '/customer/products?category=meat' },
      { name: 'Honey', path: '/customer/products?category=honey' },
      { name: 'Organic Products', path: '/customer/products?tag=organic' }
    ],
    help: [
      { name: 'Help Center', path: '/customer/help' },
      { name: 'FAQs', path: '/customer/faq' },
      { name: 'Track Order', path: '/customer/track' },
      { name: 'Returns & Refunds', path: '/customer/returns' },
      { name: 'Shipping Policy', path: '/customer/shipping' },
      { name: 'Cancellation Policy', path: '/customer/cancellation' },
      { name: 'Privacy Policy', path: '/customer/privacy' },
      { name: 'Terms of Service', path: '/customer/terms' }
    ],
    account: [
      { name: 'My Profile', path: '/customer/profile' },
      { name: 'My Orders', path: '/customer/orders' },
      { name: 'My Addresses', path: '/customer/addresses' },
      { name: 'Wishlist', path: '/customer/wishlist' },
      { name: 'Payment Methods', path: '/customer/payments' },
      { name: 'Notifications', path: '/customer/notifications' },
      { name: 'Customer Support', path: '/customer/support' },
      { name: 'Refer & Earn', path: '/customer/referral' }
    ],
    about: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Farmers', path: '/farmers' },
      { name: 'Quality Standards', path: '/quality' },
      { name: 'Sustainability', path: '/sustainability' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
      { name: 'Contact Us', path: '/contact' }
    ]
  };

  // Payment Methods
  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'MasterCard', icon: '💳' },
    { name: 'Rupay', icon: '💳' },
    { name: 'UPI', icon: '📱' },
    { name: 'Paytm', icon: '💰' },
    { name: 'Google Pay', icon: 'G' },
    { name: 'PhonePe', icon: 'P' },
    { name: 'Net Banking', icon: '🏦' },
    { name: 'COD', icon: '📦' }
  ];

  // Social Media
  const socialLinks = [
    { name: 'Facebook', icon: <Facebook size={18} />, url: '#' },
    { name: 'Twitter', icon: <Twitter size={18} />, url: '#' },
    { name: 'Instagram', icon: <Instagram size={18} />, url: '#' },
    { name: 'YouTube', icon: <Youtube size={18} />, url: '#' }
  ];

  // App Download
  const appStores = [
    { name: 'Google Play', icon: '▶️', url: '#' },
    { name: 'App Store', icon: '📱', url: '#' }
  ];

  return (
    <footer className="customer-footer">
      {/* Top Section - Main Footer */}
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand & Description */}
            <div className="footer-brand">
              <div className="brand-logo">
                <span className="logo-icon">🌾</span>
                <div className="logo-text">
                  <h2 className="logo-title">FarmFresh</h2>
                  <span className="logo-tagline">Fresh from Farm to Table</span>
                </div>
              </div>
              
              <p className="brand-description">
                We connect you directly with farmers to bring you the freshest 
                and highest quality farm products. Supporting local agriculture 
                while ensuring you get the best nature has to offer.
              </p>

              {/* Features */}
              <div className="brand-features">
                <div className="feature-item">
                  <Shield size={16} />
                  <span>100% Quality Guarantee</span>
                </div>
                <div className="feature-item">
                  <Truck size={16} />
                  <span>Fast Delivery</span>
                </div>
                <div className="feature-item">
                  <Leaf size={16} />
                  <span>Organic Certified</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  {socialLinks.map(social => (
                    <a
                      key={social.name}
                      href={social.url}
                      className="social-icon"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <div className="link-column">
                <h3>Shop by Category</h3>
                <ul>
                  {quickLinks.shop.map(link => (
                    <li key={link.name}>
                      <Link to={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-column">
                <h3>Customer Help</h3>
                <ul>
                  {quickLinks.help.map(link => (
                    <li key={link.name}>
                      <Link to={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-column">
                <h3>My Account</h3>
                <ul>
                  {quickLinks.account.map(link => (
                    <li key={link.name}>
                      <Link to={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="link-column">
                <h3>About FarmFresh</h3>
                <ul>
                  {quickLinks.about.map(link => (
                    <li key={link.name}>
                      <Link to={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-contact">
              <div className="contact-info">
                <h3>Contact Us</h3>
                <div className="contact-item">
                  <Phone size={16} />
                  <div>
                    <span className="contact-label">Call us at</span>
                    <a href="tel:+911800123456" className="contact-value">
                      +91 1800 123 456
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <div>
                    <span className="contact-label">Email us at</span>
                    <a href="mailto:support@farmfresh.com" className="contact-value">
                      support@farmfresh.com
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin size={16} />
                  <div>
                    <span className="contact-label">Visit us at</span>
                    <span className="contact-value">
                      FarmFresh HQ, Green Valley, India
                    </span>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock size={16} />
                  <div>
                    <span className="contact-label">Working Hours</span>
                    <span className="contact-value">
                      7:00 AM - 11:00 PM (Daily)
                    </span>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="newsletter">
                <h3>Stay Updated</h3>
                <p>Subscribe to get special offers and farm updates</p>
                <form className="newsletter-form">
                  <div className="email-input">
                    <Mail size={16} />
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      required 
                    />
                  </div>
                  <button type="submit" className="subscribe-btn">
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Download App */}
              <div className="download-app">
                <h3>Download Our App</h3>
                <p>Get exclusive offers & faster ordering</p>
                <div className="app-stores">
                  {appStores.map(store => (
                    <a
                      key={store.name}
                      href={store.url}
                      className="app-store-btn"
                    >
                      <span className="store-icon">{store.icon}</span>
                      <div>
                        <span className="store-label">Get on</span>
                        <span className="store-name">{store.name}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Features & Trust */}
      <div className="footer-middle">
        <div className="container">
          <div className="trust-features">
            <div className="trust-item">
              <div className="trust-icon">
                <Truck size={24} />
              </div>
              <div className="trust-content">
                <h4>Fast & Free Delivery</h4>
                <p>Free delivery on orders above ₹500</p>
              </div>
            </div>
            
            <div className="trust-item">
              <div className="trust-icon">
                <Shield size={24} />
              </div>
              <div className="trust-content">
                <h4>Quality Guarantee</h4>
                <p>100% satisfaction or money back</p>
              </div>
            </div>
            
            <div className="trust-item">
              <div className="trust-icon">
                <Award size={24} />
              </div>
              <div className="trust-content">
                <h4>Certified Organic</h4>
                <p>Direct from certified farms</p>
              </div>
            </div>
            
            <div className="trust-item">
              <div className="trust-icon">
                <CreditCard size={24} />
              </div>
              <div className="trust-content">
                <h4>Secure Payment</h4>
                <p>100% secure payment methods</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <Users size={24} />
              </div>
              <div className="trust-content">
                <h4>Support Farmers</h4>
                <p>Directly supporting local farmers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright & Payment */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            {/* Payment Methods */}
            <div className="payment-methods">
              <span className="payment-label">We Accept:</span>
              <div className="payment-icons">
                {paymentMethods.map(method => (
                  <span key={method.name} className="payment-icon" title={method.name}>
                    {method.icon}
                  </span>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="copyright">
              <p>
                © {new Date().getFullYear()} FarmFresh. All rights reserved.
                <span className="separator">|</span>
                Made with <Heart size={12} /> in India
              </p>
              <div className="additional-links">
                <Link to="/privacy">Privacy Policy</Link>
                <span className="separator">|</span>
                <Link to="/terms">Terms of Service</Link>
                <span className="separator">|</span>
                <Link to="/sitemap">Sitemap</Link>
              </div>
            </div>

            {/* Live Support */}
            <div className="live-support">
              <button className="support-btn">
                <MessageCircle size={16} />
                <span>Live Chat Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button 
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default CustomerFooter;
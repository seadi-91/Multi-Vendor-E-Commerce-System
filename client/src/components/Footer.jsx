import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { ChevronRight, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Clock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logo} alt="FarmConnect" className="h-full w-full object-cover" />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-[var(--primary)]">FarmConnect</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-white leading-relaxed max-w-full">
              Your trusted online marketplace for quality products. Shop from the comfort of your home with fast delivery across Ethiopia.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>support@farmconnect.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <span>Mon-Sat: 9AM - 8PM</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-[var(--primary)] rounded-full flex items-center justify-center transition-colors group">
                <Facebook className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-[var(--primary)] rounded-full flex items-center justify-center transition-colors group">
                <Twitter className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-[var(--primary)] rounded-full flex items-center justify-center transition-colors group">
                <Instagram className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-[var(--primary)] rounded-full flex items-center justify-center transition-colors group">
                <Youtube className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:col-span-3">
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Shop</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link to="/market" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>All Products</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/market?sort=newest" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>New Arrivals</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/market?sort=popular" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Best Sellers</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/market?discount=true" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Hot Deals</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/market" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Categories</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/gift-cards" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Gift Cards</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Customer Service</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link to="/contact" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Contact Us</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <div className="flex items-center gap-1">
                      <span>FAQ</span>
                      <span className="px-1 py-0.5 bg-[var(--primary)] text-white text-[8px] sm:text-[9px] font-bold rounded">New</span>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Shipping Info</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span className="line-clamp-1">Returns & Refunds</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/tracking" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Order Tracking</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/size-guide" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Size Guide</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Legal</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <Link to="/privacy" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Privacy Policy</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Terms of Service</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Cookie Policy</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/accessibility" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Accessibility</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="flex flex-row justify-start items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors group">
                    <span>Disclaimer</span>
                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Copyright */}
            <p className="text-xs text-gray-600 dark:text-white text-center sm:text-left">
              &copy; 2026 FarmConnect. All rights reserved.
            </p>

            {/* Center: Made with love */}
            <p className="text-xs text-gray-600 dark:text-white hidden md:block">
              Made with <Heart className="w-3 h-3 inline text-[var(--primary)] fill-[var(--primary)]" /> for Ethiopian shoppers
            </p>

            {/* Right: Quick Links */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              <Link to="/privacy" className="text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors">Privacy</Link>
              <Link to="/terms" className="text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors">Terms</Link>
              <Link to="/cookies" className="text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors">Cookies</Link>
              <Link to="/sitemap" className="text-xs text-gray-600 dark:text-white hover:text-[var(--primary)] transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield, Truck, CreditCard, Users, Heart, ChevronUp } from 'lucide-react';

const CustomerFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            {[
              { icon: <Truck size={18} />, title: 'Fast Delivery', desc: 'Free on orders above ₹500' },
              { icon: <Shield size={18} />, title: 'Quality Guarantee', desc: '100% satisfaction fresh items' },
              { icon: <CreditCard size={18} />, title: 'Secure Payment', desc: '100% encrypted checkout' },
              { icon: <Users size={18} />, title: 'Support Farmers', desc: 'Directly sourcing local pairs' },
            ].map((f) => (
              <div key={f.title} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="text-green-400 shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-xs font-semibold leading-tight">{f.title}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Info Block */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <h2 className="text-white text-lg font-bold">FarmFresh</h2>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              Connecting you directly with local agricultural producers to ensure peak freshness, seasonal nutrient metrics, and premium quality standards.
            </p>
          </div>

          {/* Nav Links Column */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white text-xs font-bold mb-2">Quick Links</h3>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/customer/help" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link to="/customer/faq" className="text-gray-400 hover:text-green-400 transition-colors">FAQs & Support</Link></li>
                <li><Link to="/customer/returns" className="text-gray-400 hover:text-green-400 transition-colors">Returns Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xs font-bold mb-2">Categories</h3>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/customer/products?category=vegetable" className="text-gray-400 hover:text-green-400 transition-colors">Vegetables</Link></li>
                <li><Link to="/customer/products?category=fruit" className="text-gray-400 hover:text-green-400 transition-colors">Fresh Fruits</Link></li>
                <li><Link to="/customer/products?category=milk" className="text-gray-400 hover:text-green-400 transition-colors">Dairy Products</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Node */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <h3 className="text-white text-xs font-bold">Contact Support</h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <Phone size={12} className="text-green-400" /> <a href="tel:+911800123456" className="hover:text-green-400">+91 1800 123 456</a>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <Mail size={12} className="text-green-400" /> <a href="mailto:support@farmfresh.com" className="hover:text-green-400">support@farmfresh.com</a>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-gray-400">
              <MapPin size={12} className="text-green-400 mt-0.5" /> <span>FarmFresh HQ, Green Valley, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Base Copyright Block */}
      <div className="border-t border-gray-800 bg-gray-950/40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} FarmFresh. Direct Local Sourcing Platform.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">Made with <Heart size={10} className="text-red-500 fill-red-500" /> in India</span>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="p-1.5 bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white rounded transition-colors"
              aria-label="Back to top"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
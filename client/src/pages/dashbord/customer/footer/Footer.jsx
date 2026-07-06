import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart, ChevronUp } from 'lucide-react';

const CustomerFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          {/* Info Block */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl">🌾</span>
              </div>
              <h2 className="text-white text-lg font-extrabold">FarmConnect</h2>
            </Link>
          </div>

          {/* Contact Node */}
          <div className="space-y-2 text-xs">
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
          <p>© {new Date().getFullYear()} FarmConnect. The largest multi-vendor marketplace for farm-fresh produce in Ethiopia.</p>
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
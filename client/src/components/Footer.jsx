import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-[var(--primary)] rounded-md flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-black text-[var(--foreground)]">FarmConnect</span>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
              Fresh from local farms to your table.
            </p>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">Contact</h4>
            <div className="space-y-1">
              <p className="text-[10px] text-[var(--muted-foreground)]">
                <a href="tel:+251911123456" className="hover:text-[var(--primary)] transition-colors">+251 911 123 456</a>
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                <a href="mailto:contact@farmconnect.com" className="hover:text-[var(--primary)] transition-colors">contact@farmconnect.com</a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">Links</h4>
            <div className="space-y-1">
              <p className="text-[10px]">
                <Link to="/market" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Marketplace</Link>
              </p>
              <p className="text-[10px]">
                <Link to="/favorites" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Favorites</Link>
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-wider mb-2">Location</h4>
            <p className="text-[10px] text-[var(--muted-foreground)]">Addis Ababa, Ethiopia</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-[var(--muted-foreground)]">
            &copy; 2026 FarmConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/contact" className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

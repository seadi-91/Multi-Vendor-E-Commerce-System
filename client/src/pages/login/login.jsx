import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLES, ROUTES_BY_ROLE } from '../../context/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Leaf, Search, Heart, ShoppingCart, Mail, Lock,
  Eye, EyeOff, Sparkles, CheckCircle2, ChevronRight, Sun, Moon, Monitor
} from 'lucide-react';
import Footer from '../../components/Footer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Login = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { cart } = useCart();

  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sync Favorites
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRedirectPath = (userData) => {
    const role = userData?.role?.toUpperCase?.() || '';

    if (role === ROLES.ADMIN || (formData.email?.toLowerCase() === 'admin@farmconnect.com' && formData.password === 'admin123')) {
      return ROUTES_BY_ROLE.admin;
    }

    if (role === ROLES.FARMER) {
      return ROUTES_BY_ROLE.farmer;
    }

    if (role === ROLES.CUSTOMER) {
      // Redirect customers to Home page, not Orders
      return '/';
    }

    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(formData.email, formData.password);

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      toast.dismiss();
      toast.success(`Welcome back, ${result.user.name || result.user.role}!`);
      setFormData(prev => ({ ...prev, password: '' }));

      const targetRoute = getRedirectPath(result.user);
      navigate(targetRoute);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Invalid email or password');
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors duration-300">

      {/* ── Header ── */}
      <header className="bg-[var(--card)] backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-[var(--border)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 md:gap-8">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 hover:rotate-6 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none video-text-flow text-[var(--foreground)]">FarmConnect</span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-semibold tracking-wider">DIRECT FROM SOIL</span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg hidden md:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search fresh vegetables, organic grains, local products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-800 focus:outline-none bg-transparent"
                />
                <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors mr-1 my-1 rounded-lg">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>

            {/* Header Right Icons */}
            <div className="flex items-center gap-2.5 md:gap-5 flex-shrink-0">

              {/* Theme Toggle Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 text-[var(--foreground)]"
                    aria-label="Toggle Theme"
                  >
                    {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                      <Moon className="w-4.5 h-4.5" />
                    ) : (
                      <Sun className="w-4.5 h-4.5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer">
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer">
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer">
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites Wishlist */}
              <Link
                to="/favorites"
                className="flex items-center justify-center w-9 h-9 rounded-xl relative transition-all text-[var(--foreground)]"
              >
                <Heart className="w-4.5 h-4.5 text-slate-600 hover:text-rose-500 transition-colors" />
                {favorites.filter(f => !String(f).startsWith('cat-')).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                    {favorites.filter(f => !String(f).startsWith('cat-')).length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/customer/cart"
                className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all relative text-[var(--foreground)]"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                <span className="text-xs hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden my-8 sm:my-12">

        {/* Decorative Blur Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-[var(--card)] border border-slate-100 dark:border-[var(--border)] rounded-3xl shadow-2xl p-8 relative z-10 space-y-6">

          {/* Form Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-700 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY ENTRANCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-[var(--foreground)] tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 dark:text-[var(--muted-foreground)] text-xs sm:text-sm font-medium">Log in to check listings and connect with direct growers.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  className="pl-10 h-11 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] text-slate-800 dark:text-[var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-[var(--muted-foreground)] focus:border-emerald-500 focus:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-[var(--foreground)] uppercase tracking-wider block">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  disabled={loading}
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] text-slate-800 dark:text-[var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-[var(--muted-foreground)] focus:border-emerald-500 focus:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* Password Strength Gauge */}
              {formData.password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${formData.password.length < 6
                        ? 'w-1/3 bg-rose-500'
                        : formData.password.length < 8
                          ? 'w-2/3 bg-amber-500'
                          : 'w-full bg-emerald-500'
                        }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${formData.password.length < 6
                    ? 'text-rose-500'
                    : formData.password.length < 8
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                    }`}>
                    {formData.password.length < 6 ? 'Weak' : formData.password.length < 8 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 disabled:opacity-50 transition-all cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button (shadcn button wrapper) */}
            <Button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="w-4.5 h-4.5" />
                </>
              )}
            </Button>
          </form>

          {/* Registration Redirect Footer */}
          <div className="text-center pt-2 border-t border-slate-50 text-xs sm:text-sm">
            <p className="text-slate-500 font-medium">
              New to FarmConnect?{' '}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-black hover:underline transition-colors"
              >
                Create an account
              </Link>
            </p>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 mt-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe direct-trade platform</span>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <Footer />

    </div>
  );
};

export default Login;
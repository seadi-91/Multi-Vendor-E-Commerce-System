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
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Leaf, Search, Heart, ShoppingCart, Mail, Lock, User, Phone, MapPin, FileText,
  Eye, EyeOff, CheckCircle2, ChevronRight, Sun, Moon, Monitor, ChevronLeft, Upload, X
} from 'lucide-react';
import Footer from '../../components/Footer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { buildRegistrationPayload } from '../../lib/registrationPayload';

const Register = () => {
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState(1); // 1: Account Type, 2: Registration Form

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

  const handleThemeChange = (newTheme) => setTheme(newTheme);

  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { register: registerUser } = useAuth();
  const { cart } = useCart();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    city: '',
    address: '',
    tinNumber: '',
  });
  const [files, setFiles] = useState({
    landMap: null,
    nationalId: null,
  });
  const [errors, setErrors] = useState({});

  // Ethiopian cities by region
  const ethiopianCities = [
    { region: 'Addis Ababa', cities: ['Addis Ababa'] },
    { region: 'Oromia', cities: ['Adama', 'Jimma', 'Bishoftu', 'Shashamane', 'Ambo', 'Nekemte', 'Harar', 'Dire Dawa'] },
    { region: 'Amhara', cities: ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Birhan', 'Debre Markos', 'Kombolcha', 'Debre Tabor'] },
    { region: 'Tigray', cities: ['Mekelle', 'Adigrat', 'Axum', 'Shire', 'Adwa'] },
    { region: 'Southern Nations', cities: ['Hawassa', 'Arba Minch', 'Wolaita Sodo', 'Dilla', 'Hosanna', 'Jinka'] },
    { region: 'Somali', cities: ['Jijiga', 'Gode', 'Kebri Dahar', 'Degahbur'] },
    { region: 'Afar', cities: ['Semera', 'Asaita', 'Dubti', 'Awash'] },
    { region: 'Benishangul-Gumuz', cities: ['Assosa', 'Bambasi'] },
    { region: 'Gambela', cities: ['Gambela', 'Abobo'] },
    { region: 'Harari', cities: ['Harar'] },
    { region: 'Sidama', cities: ['Hawassa', 'Yirgalem', 'Aleta Wondo'] },
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sync Favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    const updateFavorites = () => {
      const saved = localStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    };
    window.addEventListener('storage', updateFavorites);
    window.addEventListener('favoritesUpdated', updateFavorites);
    return () => {
      window.removeEventListener('storage', updateFavorites);
      window.removeEventListener('favoritesUpdated', updateFavorites);
    };
  }, []);

  const validateField = (fieldName, value, currentData = formData, currentFiles = files) => {
    const normalizedRole = currentData.role === ROLES.FARMER ? 'farmer' : 'customer';
    const trimmedValue = String(value ?? '').trim();

    switch (fieldName) {
      case 'name': {
        if (!trimmedValue) return 'Name is required';
        if (trimmedValue.length < 2) return 'Name must be at least 2 characters';
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/.test(trimmedValue)) {
          return 'Name can only contain letters, spaces, periods, apostrophes, or hyphens';
        }
        return '';
      }
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedValue) return 'Email is required';
        if (!emailRegex.test(trimmedValue)) return 'Please enter a valid email address';
        return '';
      }
      case 'phone': {
        const digitsOnly = trimmedValue.replace(/\D/g, '');
        const phoneRegex = /^\+?\d[\d\s().-]{6,}$/;
        if (!trimmedValue) return 'Phone number is required';
        if (!phoneRegex.test(trimmedValue) || digitsOnly.length < 9) return 'Please enter a valid phone number';
        return '';
      }
      case 'password': {
        if (!trimmedValue) return 'Password is required';
        if (trimmedValue.length < 6) return 'Password must be at least 6 characters';
        return '';
      }
      case 'confirmPassword': {
        if (!trimmedValue) return 'Please confirm your password';
        if (currentData.password !== trimmedValue) return 'Passwords do not match';
        return '';
      }
      case 'city': {
        if (normalizedRole === 'farmer' && !trimmedValue) return 'City is required for farmers';
        return '';
      }
      case 'address': {
        if (normalizedRole === 'farmer' && !trimmedValue) return 'Farm address is required';
        return '';
      }
      case 'tinNumber': {
        if (normalizedRole === 'farmer' && !trimmedValue && !currentFiles.landMap) {
          return 'Either TIN Number or Land Map file is required';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    const fieldError = validateField(name, value, nextFormData, files);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      const nextFiles = { ...files, [fileType]: file };
      setFiles(nextFiles);
      if (fileType === 'landMap') {
        setErrors(prev => ({
          ...prev,
          tinNumber: validateField('tinNumber', formData.tinNumber, { ...formData, role: formData.role }, nextFiles),
        }));
      }
      if (errors[fileType]) {
        setErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const normalizedRole = formData.role === ROLES.FARMER ? 'farmer' : 'customer';
    const trimmedName = formData.name?.trim() || '';
    const trimmedEmail = formData.email?.trim() || '';
    const trimmedPhone = formData.phone?.trim() || '';

    // Name validation
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/.test(trimmedName)) {
      newErrors.name = 'Name can only contain letters, spaces, periods, apostrophes, or hyphens';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    const phoneRegex = /^\+?\d[\d\s().-]{6,}$/;
    if (!trimmedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(trimmedPhone) || digitsOnly.length < 9) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Farmer-specific validations
    if (normalizedRole === 'farmer') {
      if (!formData.city?.trim()) {
        newErrors.city = 'City is required for farmers';
      }
      if (!formData.address?.trim()) {
        newErrors.address = 'Farm address is required';
      }

      // National ID validation (mandatory for farmers)
      if (!files.nationalId) {
        newErrors.nationalId = 'National ID is required';
      }

      // TIN Number OR Land Map validation (at least one required)
      if (!formData.tinNumber?.trim() && !files.landMap) {
        newErrors.tinOrLandMap = 'Either TIN Number or Land Map file is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/market?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleAccountTypeSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setStep(2);
  };

  const getRedirectPath = (userData, selectedRole) => {
    const role = userData?.role?.toUpperCase?.() || '';

    if (role === ROLES.ADMIN || selectedRole === ROLES.ADMIN) {
      return ROUTES_BY_ROLE.admin;
    }

    if (role === ROLES.FARMER || selectedRole === ROLES.FARMER) {
      return ROUTES_BY_ROLE.farmer;
    }

    return ROUTES_BY_ROLE.customer;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      const payload = buildRegistrationPayload(formData, files);
      const result = await registerUser(payload);
      toast.dismiss();
      toast.success(`Welcome, ${formData.name?.trim() || 'there'}!`);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setFiles({ landMap: null, nationalId: null });

      const targetRoute = getRedirectPath(result?.user, formData.role);
      navigate(targetRoute);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Registration failed');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col transition-colors duration-300">

      {/* Header - Same as Login */}
      <header className="bg-[var(--card)] backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-[var(--border)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 hover:rotate-6 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none video-text-flow text-[var(--foreground)]">FarmConnect</span>
                <span className="text-[10px] text-[var(--muted-foreground)] font-semibold tracking-wider">DIRECT FROM SOIL</span>
              </div>
            </Link>

            <div className="flex-1 max-w-lg hidden md:block">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-50 dark:bg-[var(--card)] rounded-xl border border-slate-100 dark:border-[var(--border)] focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[var(--card)] transition-all shadow-inner overflow-hidden">
                <input
                  type="text"
                  placeholder="Search fresh vegetables, organic grains, local products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-[var(--foreground)] focus:outline-none bg-transparent"
                />
                <button type="submit" className="p-2.5 bg-emerald-600 hover:bg-emerald-700 transition-colors mr-1 my-1 rounded-lg">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2.5 md:gap-5 flex-shrink-0">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-xl transition-all active:scale-95 text-[var(--foreground)]">
                    {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                      <Moon className="w-4.5 h-4.5" />
                    ) : (
                      <Sun className="w-4.5 h-4.5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 dark:bg-[var(--card)] dark:border-[var(--border)]">
                  <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="cursor-pointer dark:text-[var(--foreground)] dark:hover:bg-[var(--border)] dark:hover:text-[var(--foreground)]">
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('system')} className="cursor-pointer dark:text-[var(--foreground)] dark:hover:bg-[var(--border)] dark:hover:text-[var(--foreground)]">
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('light')} className="cursor-pointer dark:text-[var(--foreground)] dark:hover:bg-[var(--border)] dark:hover:text-[var(--foreground)]">
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/favorites" className="flex items-center justify-center w-9 h-9 rounded-xl relative transition-all text-[var(--foreground)]">
                <Heart className="w-4.5 h-4.5 text-slate-600 hover:text-rose-500 dark:text-slate-300 transition-colors" />
                {favorites.filter(f => !String(f).startsWith('cat-')).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                    {favorites.filter(f => !String(f).startsWith('cat-')).length}
                  </span>
                )}
              </Link>

              <Link to="/customer/cart" className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold transition-all relative text-[var(--foreground)]">
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

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden my-8 sm:my-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-100 dark:bg-teal-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        {/* Step 1: Account Type Selection */}
        {step === 1 && (
          <div className="w-full max-w-lg bg-white dark:bg-[var(--card)] border border-slate-100 dark:border-[var(--border)] rounded-2xl shadow-2xl p-6 relative z-10 space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>STEP 1 OF 2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-[var(--foreground)] tracking-tight">Choose Account Type</h2>
              <p className="text-slate-500 dark:text-[var(--muted-foreground)] text-xs font-medium">Select how you'd like to use FarmConnect</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Card */}
              <Card
                className="cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-slate-200 dark:border-[var(--border)] hover:border-blue-500 dark:hover:border-blue-500 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10"
                onClick={() => handleAccountTypeSelect(ROLES.CUSTOMER)}
              >
                <CardContent className="p-5 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-[var(--foreground)] mb-1">Customer</h3>
                    <p className="text-xs text-slate-600 dark:text-[var(--muted-foreground)] leading-relaxed">Browse and purchase fresh organic produce from local farmers</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-10 text-sm shadow-lg">
                    Continue
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Farmer Card */}
              <Card
                className="cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-slate-200 dark:border-[var(--border)] hover:border-emerald-500 dark:hover:border-emerald-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-800 dark:to-emerald-900/10"
                onClick={() => handleAccountTypeSelect(ROLES.FARMER)}
              >
                <CardContent className="p-5 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-[var(--foreground)] mb-1">Farmer</h3>
                    <p className="text-xs text-slate-600 dark:text-[var(--muted-foreground)] leading-relaxed">Sell your farm products directly to customers and grow your business</p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-10 text-sm shadow-lg">
                    Continue
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-3 border-t border-slate-50 dark:border-gray-800 text-xs">
              <p className="text-slate-500 dark:text-gray-400 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-black hover:underline transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <div className="w-full max-w-xl bg-white dark:bg-[var(--card)] border border-slate-100 dark:border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-white text-xs font-bold mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>STEP 2 OF 2</span>
                    </div>
                    <h2 className="text-2xl font-black">
                      {formData.role === ROLES.FARMER ? 'Farmer Registration' : 'Customer Registration'}
                    </h2>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-white hover:bg-white/20 hover:text-white h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
            </div>

            {/* Form Content */}
            {/* Form Content */}
            <form noValidate onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b dark:border-[var(--border)]">
                  <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--foreground)]">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        disabled={loading}
                        className={`pl-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 dark:placeholder:text-[var(--muted-foreground)] focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm ${errors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-xs text-red-500 font-semibold mt-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        disabled={loading}
                        autoComplete="email"
                        className={`pl-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 dark:placeholder:text-[var(--muted-foreground)] focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-semibold mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+251 9XX XXX XXX"
                        disabled={loading}
                        className={`pl-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm ${errors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1">{errors.phone}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      City {formData.role === ROLES.FARMER && <span className="text-red-500">*</span>}
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, city: value }));
                        if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                      }}
                    >
                      <SelectTrigger className={`h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 focus:border-emerald-500 focus:ring-emerald-500/10 ${errors.city ? 'border-red-500 dark:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[var(--card)] border-slate-200 dark:border-[var(--border)] max-h-[300px]">
                        {ethiopianCities.map((regionData) => (
                          <React.Fragment key={regionData.region}>
                            <div className="px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50/50 dark:bg-emerald-900/20 sticky top-0">
                              {regionData.region}
                            </div>
                            {regionData.cities.map((city) => (
                              <SelectItem
                                key={`${regionData.region}-${city}`}
                                value={city}
                                className="pl-6 text-slate-700 dark:text-[var(--foreground)] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 focus:bg-emerald-100 dark:focus:bg-emerald-900/40 cursor-pointer"
                              >
                                {city}
                              </SelectItem>
                            ))}
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="text-xs text-red-500 font-semibold mt-1">{errors.city}</p>}
                  </div>
                </div>
              </div>

              {/* Farmer Specific Fields */}
              {formData.role === ROLES.FARMER && (
                <div className="space-y-4 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 dark:border-emerald-900/30">
                    <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--foreground)]">Farm Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                        Farm Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400 z-10" />
                        <Textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={3}
                          required
                          placeholder="Enter your complete farm address..."
                          disabled={loading}
                          className={`pl-10 pr-3 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10 transition-all font-semibold text-sm resize-none ${errors.address ? 'border-red-500 dark:border-red-500' : ''}`}
                        />
                      </div>
                      {errors.address && <p className="text-xs text-red-500 font-semibold mt-1">{errors.address}</p>}
                    </div>

                    {/* TIN Number or Land Map - At least one required */}
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Either TIN Number or Land Map file is required
                      </p>

                      {/* TIN Number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="tinNumber" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                          TIN Number
                        </Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            id="tinNumber"
                            name="tinNumber"
                            value={formData.tinNumber}
                            onChange={(e) => {
                              handleChange(e);
                              if (errors.tinOrLandMap) setErrors(prev => ({ ...prev, tinOrLandMap: '' }));
                            }}
                            placeholder="Enter TIN number"
                            disabled={loading}
                            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm"
                          />
                        </div>
                      </div>
                      {errors.tinOrLandMap && <p className="text-xs text-red-500 font-semibold mt-2">{errors.tinOrLandMap}</p>}
                    </div>

                    {/* National ID - Mandatory (side by side with land map in grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Land Map File Upload */}
                      <div className="space-y-1.5">
                        <Label htmlFor="landMapDoc" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                          Land Map
                        </Label>
                        <div className="relative">
                          <input
                            type="file"
                            id="landMapDoc"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'landMap')}
                            disabled={loading}
                            className="hidden"
                          />
                          {!files.landMap ? (
                            <Label
                              htmlFor="landMapDoc"
                              className="flex items-center gap-2 w-full h-12 border-2 border-dashed border-slate-300 dark:border-[var(--border)] rounded-xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all px-2.5"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <div className="text-left flex-1">
                                <p className="text-[11px] font-semibold text-slate-600 dark:text-gray-400 leading-tight">Upload map</p>
                                <p className="text-[9px] text-slate-400 dark:text-gray-500">PDF, JPG, PNG</p>
                              </div>
                            </Label>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl h-12">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-800 dark:text-[var(--foreground)] truncate">{files.landMap.name}</p>
                                  <p className="text-[9px] text-slate-500 dark:text-gray-400">{(files.landMap.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('landMap')}
                                className="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 ml-1"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* National ID */}
                      <div className="space-y-1.5">
                        <Label htmlFor="nationalId" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                          National ID <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <input
                            type="file"
                            id="nationalId"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'nationalId')}
                            disabled={loading}
                            className="hidden"
                          />
                          {!files.nationalId ? (
                            <Label
                              htmlFor="nationalId"
                              className={`flex items-center gap-2 w-full h-12 border-2 border-dashed rounded-xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all px-2.5 ${errors.nationalId ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-[var(--border)]'}`}
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <div className="text-left flex-1">
                                <p className="text-[11px] font-semibold text-slate-600 dark:text-gray-400 leading-tight">Upload ID</p>
                                <p className="text-[9px] text-slate-400 dark:text-gray-500">PDF, JPG, PNG</p>
                              </div>
                            </Label>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl h-12">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-800 dark:text-[var(--foreground)] truncate">{files.nationalId.name}</p>
                                  <p className="text-[9px] text-slate-500 dark:text-gray-400">{(files.nationalId.size / 1024).toFixed(1)} KB</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile('nationalId')}
                                className="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 ml-1"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {errors.nationalId && <p className="text-xs text-red-500 font-semibold mt-1">{errors.nationalId}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b dark:border-[var(--border)]">
                  <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-[var(--foreground)]">Security</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Create password"
                        disabled={loading}
                        autoComplete="new-password"
                        className={`pl-10 pr-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-semibold mt-1">{errors.password}</p>}
                    {formData.password && !errors.password && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${formData.password.length < 6
                              ? 'w-1/3 bg-red-500'
                              : formData.password.length < 8
                                ? 'w-2/3 bg-amber-500'
                                : 'w-full bg-emerald-500'
                              }`}
                          />
                        </div>
                        <span className={`text-xs font-bold ${formData.password.length < 6
                          ? 'text-red-500'
                          : formData.password.length < 8
                            ? 'text-amber-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {formData.password.length < 6 ? 'Weak' : formData.password.length < 8 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-[var(--muted-foreground)] uppercase tracking-wider">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm password"
                        disabled={loading}
                        autoComplete="new-password"
                        className={`pl-10 pr-10 h-10 rounded-xl border-slate-200 dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all font-semibold text-sm ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 font-semibold mt-1">{errors.confirmPassword}</p>}
                    {formData.confirmPassword && !errors.confirmPassword && (
                      <p className={`text-xs font-semibold ${formData.password === formData.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                        }`}>
                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Submit */}
              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl border-2 border-slate-200 dark:border-[var(--border)] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-0.5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 transition-all cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 dark:text-[var(--muted-foreground)] group-hover:text-slate-800 dark:group-hover:text-[var(--foreground)]">
                    I agree to the{' '}
                    <Link to="/terms" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl text-base shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      <span>Create {formData.role === ROLES.FARMER ? 'Farmer' : 'Customer'} Account</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-slate-500 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold hover:underline">
                    Sign In
                  </Link>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Register;

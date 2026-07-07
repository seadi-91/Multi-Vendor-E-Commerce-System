import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import Footer from '../../components/Footer';
import { ShoppingBag, Home, Truck, CreditCard, Phone, Wallet, Package, Check, Sun, Moon, Monitor, User, Settings, LogOut, MessageSquare } from 'lucide-react';

const ThemeToggle = ({ theme, setTheme }) => {
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const renderThemeIcon = () => {
    if (theme === 'system') return <Monitor className="w-4.5 h-4.5" />;
    return isDark ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-700 shadow-sm hover:bg-amber-200 transition-all" aria-label="Toggle Theme">
          {renderThemeIcon()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg dark:bg-slate-900 dark:border-slate-700">
        <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
          <Moon className="mr-2 h-4 w-4 text-amber-500" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800">
          <Monitor className="mr-2 h-4 w-4 text-amber-500" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Checkout = () => {
  const { cart, cartCount, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cash',
    isDelivery: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [wantsReview, setWantsReview] = useState(true);

  const formatPrice = (price) => Number(price || 0).toFixed(2);

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const pageContainerClass = theme === 'dark'
    ? 'min-h-screen bg-black text-white'
    : theme === 'light'
      ? 'min-h-screen bg-white text-black'
      : 'min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-slate-900';
  const cardClass = theme === 'dark'
    ? 'bg-slate-950 border-slate-800 text-white'
    : 'bg-white border-gray-200 text-slate-900';
  const inputClass = theme === 'dark'
    ? 'bg-slate-900 text-white border-slate-700 placeholder:text-slate-400'
    : 'bg-gray-50 text-slate-900 border-gray-200 placeholder:text-gray-400';
  const labelClass = theme === 'dark'
    ? 'text-slate-200'
    : 'text-gray-700';
  const subTextClass = theme === 'dark'
    ? 'text-slate-400'
    : 'text-gray-600';
  const sectionTitleClass = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';
  const summaryRowClass = theme === 'dark'
    ? 'bg-slate-900 hover:bg-slate-800 text-white'
    : 'bg-gray-50 hover:bg-gray-100 text-slate-900';
  const summaryHeaderClass = theme === 'dark'
    ? 'bg-slate-900 text-white'
    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white';
  const totalBoxClass = theme === 'dark'
    ? 'bg-slate-900'
    : 'bg-gradient-to-br from-emerald-50 to-teal-50';

  const subtotalCents = cart.reduce((sum, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 0;
    return sum + Math.round(itemPrice * 100 * itemQty);
  }, 0);

  const subtotal = subtotalCents / 100;
  const deliveryFee = formData.isDelivery ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form first before showing modal
    if (!formData.fullName || formData.fullName.trim() === '') {
      setError('Full name is required');
      return;
    }
    if (!formData.phone || formData.phone.trim() === '') {
      setError('Phone number is required');
      return;
    }
    if (!formData.email || formData.email.trim() === '') {
      setError('Email address is required');
      return;
    }
    if (formData.isDelivery) {
      if (!formData.city || formData.city.trim() === '') {
        setError('City is required for delivery');
        return;
      }
      if (!formData.address || formData.address.trim() === '') {
        setError('Address is required for delivery');
        return;
      }
    }
    if (!cart || cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError(null);
    // If payment method is chapa, skip modal and go directly
    if (formData.paymentMethod === 'chapa') {
      submitOrder(false);
    } else {
      setReviewModalOpen(true);
    }
  };

  const submitOrder = async (wantsReviewValue) => {
    setIsSubmitting(true);
    setError(null);
    setReviewModalOpen(false);

    try {
      console.log('=== Starting order submission ===');
      console.log('User:', user);
      console.log('Cart:', cart);
      console.log('FormData:', formData);
      console.log('Wants review:', wantsReviewValue);

      // ── Check authentication ─────────────────────────────────────────────
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      if (!token) {
        throw new Error('You must be logged in to place an order. Please log in and try again.');
      }

      // ── Chapa payment: initiate transaction and redirect ──────────────
      if (formData.paymentMethod === 'chapa') {
        const nameParts = formData.fullName.trim().split(' ');
        const first_name = nameParts[0] || 'Customer';
        const last_name = nameParts.slice(1).join(' ') || '';

        const { data } = await api.post('/payments/chapa/initiate', {
          amount: total,
          email: formData.email,
          first_name,
          last_name,
        });

        // Redirect browser to Chapa checkout page
        window.location.href = data.checkout_url;
        return; // stop further execution
      }

      // ── Prepare order items with proper productId field ─────────────────
      const orderItems = cart.map(item => {
        const productId = item.id || item._id || item.productId;
        console.log(`Processing item: ${item.name}, productId: ${productId}`);
        return {
          productId: productId,
          name: item.name || item.productName || 'Product',
          description: item.description || '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || '',
          unit: item.unit || 'kg'
        };
      });

      // Validate all items have productId
      const invalidItems = orderItems.filter(item => !item.productId);
      if (invalidItems.length > 0) {
        throw new Error(`Some items are missing product ID: ${invalidItems.map(i => i.name).join(', ')}`);
      }

      // subtotal, deliveryFee, and total are already computed at component scope

      const orderPayload = {
        customerId: user?.id || null,
        items: orderItems,
        total: parseFloat(total.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: 0,
        status: 'processing',
        paymentMethod: formData.paymentMethod || 'cash',
        paymentStatus: formData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
        fullName: formData.fullName || 'Guest',
        email: formData.email || '',
        phone: formData.phone || '',
        city: formData.city || '',
        address: formData.address || '',
        additionalInfo: formData.isDelivery ? `Delivery to ${formData.city}, ${formData.address}` : 'Pickup',
        estimatedDelivery: formData.isDelivery ? '30-45 minutes' : '15-20 minutes',
        wantsReview: wantsReviewValue
      };

      console.log('Order payload:', JSON.stringify(orderPayload, null, 2));

      const response = await api.post('/orders', orderPayload);

      console.log('Response received:', response);

      if (!response || !response.data) {
        throw new Error('No response received from server');
      }

      const createdOrder = {
        ...response.data,
        id: response.data.id || Date.now(),
        orderNumber: response.data.orderCode || `ORD-${String(response.data.id || Date.now()).padStart(5, '0')}`,
        orderCode: response.data.orderCode || `ORD-${String(response.data.id || Date.now()).padStart(5, '0')}`,
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        timestamp: new Date().toISOString(),
        status: response.data.status || 'processing',
        paymentStatus: response.data.paymentStatus || (formData.paymentMethod === 'cash' ? 'unpaid' : 'paid'),
        paymentMethod: response.data.paymentMethod || formData.paymentMethod || 'cash',
        fullName: response.data.fullName || formData.fullName || 'Customer',
        email: response.data.email || formData.email || '',
        phone: response.data.phone || formData.phone || '',
        city: response.data.city || formData.city || '',
        address: response.data.address || formData.address || '',
        additionalInfo: response.data.additionalInfo || formData.address || '',
        estimatedDelivery: response.data.estimatedDelivery || '30-45 minutes',
        items: orderItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: 0,
        total: parseFloat(total.toFixed(2)),
        wantsReview: wantsReviewValue
      };

      console.log('Created order:', createdOrder);

      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const nextOrders = [createdOrder, ...savedOrders.filter((entry) => String(entry.id) !== String(createdOrder.id))];
      localStorage.setItem('orders', JSON.stringify(nextOrders));

      setOrderPlaced(true);

      setTimeout(() => {
        clearCart();
        navigate('/customer/orders', { state: { orderSuccess: true, latestOrder: createdOrder } });
      }, 2500);
    } catch (error) {
      console.error('Order submission failed:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      const errMsg =
        error?.response?.data?.chapaError?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Order submission failed. Please try again.';
      
      console.error('Final error message:', errMsg);
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Discover fresh products and add them to your cart</p>
          <button
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
            onClick={() => navigate('/customer/dashboard')}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${pageContainerClass} py-12 px-4 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          {orderPlaced ? (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-10 text-center max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300">
                <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
                  <Check className="w-16 h-16" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">Order Confirmed!</h2>
                <p className="text-gray-600 mb-8 text-lg">Your order has been successfully placed</p>
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-emerald-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Order Total</span>
                      <span className="font-bold text-emerald-700 text-xl">{formatPrice(total)} ETB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estimated Delivery</span>
                      <span className="font-semibold text-gray-900">30-45 minutes</span>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full animate-pulse" style={{ animation: 'progress 3s linear forwards' }} />
                </div>
                <p className="text-sm text-gray-500">Redirecting to your orders...</p>
              </div>
              <style>{`@keyframes progress { from { width: 0; } to { width: 100%; } }`}</style>
            </div>
          ) : reviewModalOpen ? (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className={`${cardClass} rounded-3xl p-8 max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300`}>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Review your order</h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Would you like to rate and review the products after you receive your order?
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => submitOrder(true)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-70"
                  >
                    Yes, I'll Leave a Review
                  </button>
                  <button
                    onClick={() => submitOrder(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-2xl border-2 border-[var(--border)] text-[var(--foreground)] font-bold hover:bg-[var(--secondary)] transition-all disabled:opacity-70"
                  >
                    No, Maybe Later
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10 grid gap-4 md:flex md:items-center md:justify-between">
                <div className="flex items-center gap-4 justify-start">
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--secondary)]/70 hover:bg-[var(--secondary)] transition-all text-[var(--foreground)]">
                        <span className="font-semibold">Me</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="bottom" sideOffset={6} className="min-w-[180px] p-1.5 bg-[var(--card)] border-[var(--border)]">
                      <DropdownMenuItem onClick={() => navigate('/customer/profile')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/customer/dashboard/orders')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/customer/settings')} className="flex items-center justify-start cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => logout()} className="flex items-center justify-start cursor-pointer text-[var(--destructive)] hover:bg-[var(--destructive)/10]">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="text-left">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">Checkout</h1>
                    <p className={`${subTextClass}`}>Complete your order in a few simple steps</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6 max-w-2xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Combined Personal Info & Delivery Card */}
                    <div className={`${cardClass} rounded-3xl shadow-xl border-2 p-8 hover:shadow-2xl transition-shadow ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100'}`}>
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`w-14 h-14 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Home className={`w-7 h-7 ${theme === 'dark' ? 'text-white' : 'text-white'}`} />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-black ${sectionTitleClass}`}>Contact & Delivery</h3>
                          <p className={`text-sm ${subTextClass}`}>Your information and delivery preferences</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className={`text-xs font-extrabold ${labelClass} mb-3 block uppercase tracking-wider`}>Full Name *</label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className={`w-full px-5 py-4 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-medium transition-all ${inputClass} hover:${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className={`text-xs font-extrabold ${labelClass} mb-3 block uppercase tracking-wider`}>Phone Number *</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className={`w-full px-5 py-4 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-medium transition-all ${inputClass} hover:${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
                              placeholder="+251 9XX XXX XXX"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`text-xs font-extrabold ${labelClass} mb-3 block uppercase tracking-wider`}>Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-5 py-4 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-medium transition-all ${inputClass} hover:${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}
                            placeholder="john@example.com"
                          />
                        </div>

                        {/* Delivery Checkbox - Small */}
                        <div className="pt-4 border-t-2 border-gray-100">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              name="isDelivery"
                              checked={formData.isDelivery}
                              onChange={(e) => setFormData({ ...formData, isDelivery: e.target.checked })}
                              className={`w-5 h-5 rounded border-2 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'} text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer`}
                            />
                            <div className="flex items-center gap-2">
                              <Truck className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                I need home delivery
                              </span>
                            </div>
                          </label>
                          {!formData.isDelivery && (
                            <p className="text-xs text-gray-600 mt-2 ml-8 flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-500" />
                              You'll pick up your order
                            </p>
                          )}
                        </div>

                        {formData.isDelivery && (
                          <div className="space-y-5 pt-2 animate-in slide-in-from-top duration-300">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={`text-xs font-extrabold ${labelClass} mb-3 block uppercase tracking-wider`}>City *</label>
                                <select name="city" value={formData.city} onChange={handleInputChange} required className={`w-full px-5 py-4 rounded-xl border-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-medium transition-all ${inputClass} hover:${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                                  <option value="">Select City</option>
                                  <option value="addis-ababa">Addis Ababa</option>
                                  <option value="adama">Adama</option>
                                  <option value="bahir-dar">Bahir Dar</option>
                                  <option value="mekelle">Mekelle</option>
                                  <option value="hawassa">Hawassa</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-extrabold text-gray-700 mb-3 block uppercase tracking-wider">Subcity *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className={`w-full px-5 py-4 rounded-xl border-2 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-medium transition-all ${inputClass} hover:${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`} placeholder="e.g., Bole" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className={`flex items-center gap-2 text-xl font-bold mb-5 ${sectionTitleClass}`}>
                        <CreditCard className="text-emerald-600" />
                        Payment Method
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {['cash', 'card', 'mobile', 'chapa'].map((method) => (
                          <label
                            key={method}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method
                              ? 'border-emerald-500 bg-emerald-50'
                              : `${theme === 'dark' ? 'border-slate-700 bg-slate-950 hover:border-slate-600' : 'border-gray-300 bg-white hover:border-emerald-300'}`
                              }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              checked={formData.paymentMethod === method}
                              onChange={handleInputChange}
                              className="w-5 h-5 text-emerald-600"
                            />
                            <div className="flex items-center gap-3">
                              {method === 'cash' && <Truck className="text-2xl text-emerald-700" />}
                              {method === 'card' && <CreditCard className="text-2xl text-emerald-700" />}
                              {method === 'mobile' && <Phone className="text-2xl text-emerald-700" />}
                              {method === 'chapa' && (
                                <svg className="w-6 h-6 text-emerald-700" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                </svg>
                              )}
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {method === 'cash' ? 'Cash on Delivery'
                                    : method === 'card' ? 'Credit/Debit Card'
                                      : method === 'mobile' ? 'Mobile Payment'
                                        : 'Pay with Chapa'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {method === 'cash' ? 'Pay when you receive your order'
                                    : method === 'card' ? 'Pay securely with your card'
                                      : method === 'mobile' ? 'CBE Birr, Telebirr, etc.'
                                        : 'Secure online payment via Chapa'}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button type="button" onClick={() => navigate(-1)} className={`flex-1 px-8 py-4 border-2 rounded-2xl font-bold transition-all ${theme === 'dark' ? 'border-slate-700 text-white hover:bg-slate-900' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
                        Back
                      </button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="text-2xl" />
                            Place Order - {formatPrice(total)} ETB
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className={`mt-4 p-4 border-2 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300 ${theme === 'dark' ? 'bg-slate-950 border-red-800' : 'bg-red-50 border-red-200'}`}>
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-red-900 mb-1">Order Failed</h4>
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <button
                          onClick={() => setError(null)}
                          className="text-red-400 hover:text-red-600 text-xl font-bold leading-none"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className={`sticky top-8 rounded-3xl shadow-2xl border-2 overflow-hidden ${cardClass} ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100'}`}>
                    <div className={`${summaryHeaderClass} p-8`}
                    >
                      <h3 className="text-2xl font-black mb-1">Order Summary</h3>
                      <p className="text-emerald-100 text-sm">{cart.length} {cart.length === 1 ? 'item' : 'items'} in cart</p>
                    </div>

                    <div className={`p-6 space-y-4 border-b-2 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'} max-h-80 overflow-y-auto`}>
                      {cart.map(item => (
                        <div key={item._id} className={`${summaryRowClass} flex justify-between items-start p-3 rounded-xl transition-colors`}>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.quantity}x @ {formatPrice(item.price)} ETB</p>
                          </div>
                          <p className="font-black text-emerald-700">{formatPrice(item.price * item.quantity)} ETB</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 space-y-3 border-b-2 border-gray-100">
                      <div className={`flex justify-between text-sm ${subTextClass}`}>
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)} ETB</span>
                      </div>
                      <div className={`flex justify-between text-sm ${subTextClass}`}>
                        <span>Delivery</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)} ETB</span>
                      </div>
                    </div>

                    <div className={`p-8 ${totalBoxClass}`}>
                      <div className="flex justify-between items-center">
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-black text-lg`}>Total</span>
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text'} text-3xl font-black`}>{formatPrice(total)} ETB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;

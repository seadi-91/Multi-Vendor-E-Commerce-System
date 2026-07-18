import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api, { customerAPI } from '../../api';
import Header from '../../components/Header';
import { ShoppingBag, Home, Truck, CreditCard, Phone, Wallet, Package, Check, MessageSquare, Star } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'chapa',
    isDelivery: true
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!user) return;
      try {
        const response = await customerAPI.getAddresses();
        const addresses = response.data?.addresses || response.data || [];
        setSavedAddresses(addresses);
        if (formData.isDelivery && !formData.city && !formData.address) {
          fillDefaultDeliveryAddress(addresses);
        }
      } catch (err) {
        console.error('Failed to load saved addresses', err);
      }
    };

    loadSavedAddresses();
  }, [user]);

  useEffect(() => {
    if (formData.isDelivery && savedAddresses.length && !formData.city && !formData.address) {
      fillDefaultDeliveryAddress(savedAddresses);
    }
  }, [formData.isDelivery, savedAddresses]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [wantsReview, setWantsReview] = useState(true);
  const [comingSoonMessage, setComingSoonMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

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
    : 'bg-white text-slate-900 border-gray-200 placeholder:text-gray-400';
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

  const fillDefaultDeliveryAddress = (addresses) => {
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
    if (!defaultAddress) return;

    setFormData((prev) => ({
      ...prev,
      city: prev.city || defaultAddress.city || '',
      address: prev.address || [defaultAddress.street, defaultAddress.woreda, defaultAddress.subcity].filter(Boolean).join(', '),
    }));
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
    // Always submit the order immediately; do not show pre-payment review prompt
    submitOrder(false);
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

      // ── Create order payload with pending status ─────────────────────────
      const orderPayload = {
        customerId: user?.id || null,
        items: orderItems,
        total: parseFloat(total.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: 0,
        status: 'pending',
        paymentMethod: formData.paymentMethod || 'chapa',
        paymentStatus: 'pending',
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

      // ── Step 1: Create order in database FIRST ──────────────────────────
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
        status: response.data.status || 'pending',
        paymentStatus: response.data.paymentStatus || 'pending',
        paymentMethod: response.data.paymentMethod || formData.paymentMethod || 'chapa',
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

      // Save order to localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const nextOrders = [createdOrder, ...savedOrders.filter((entry) => String(entry.id) !== String(createdOrder.id))];
      localStorage.setItem('orders', JSON.stringify(nextOrders));

      // ── Step 2: If Chapa payment, initiate transaction and redirect ─────
      if (formData.paymentMethod === 'chapa') {
        const checkoutEmail = user?.email || formData.email;
        const checkoutName = user?.name || formData.fullName || 'Customer';
        const nameParts = checkoutName.trim().split(' ');
        const first_name = nameParts[0] || 'Customer';
        const last_name = nameParts.slice(1).join(' ') || '';

        const chapaResponse = await api.post('/payments/chapa/initiate', {
          amount: parseFloat(total.toFixed(2)),
          customer_email: checkoutEmail,
          first_name,
          last_name,
          tx_ref: createdOrder.orderCode || `TX-${Date.now()}`,
          orderId: createdOrder.id
        });

        // Redirect browser to Chapa checkout page
        window.location.href = chapaResponse.data.checkout_url;
        return; // stop further execution
      }

      // ── Step 3: For non-Chapa payments, show success immediately ────────
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order submission failed:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);

      const errorData = error?.response?.data;
      let errMsg = 'Order submission failed. Please try again.';

      if (errorData) {
        if (typeof errorData === 'string') {
          errMsg = errorData;
        } else if (typeof errorData.message === 'string' && errorData.message !== 'Invalid payment request.') {
          errMsg = errorData.message;
        } else if (typeof errorData.suggestion === 'string') {
          errMsg = errorData.suggestion;
        } else if (typeof errorData.suggestion === 'object') {
          errMsg = JSON.stringify(errorData.suggestion, null, 2);
        } else if (typeof errorData.chapaError === 'string') {
          errMsg = errorData.chapaError;
        } else if (typeof errorData.chapaError === 'object') {
          errMsg = JSON.stringify(errorData.chapaError, null, 2);
        } else if (typeof errorData.error === 'string') {
          errMsg = errorData.error;
        } else if (typeof errorData.message === 'object') {
          errMsg = JSON.stringify(errorData.message, null, 2);
        } else {
          errMsg = JSON.stringify(errorData, null, 2);
        }
      } else if (typeof error?.message === 'string') {
        errMsg = error.message;
      }

      console.error('Final error message:', errMsg);
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated handler for Place Order button - Hybrid Real API + Fallback Simulation
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.isDelivery && (!formData.city || !formData.address)) {
      setError('Please fill in delivery address');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log('=== Starting Chapa payment flow ===');

      // Check authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to place an order');
      }

      // Prepare order items
      const orderItems = cart.map(item => {
        const productId = item.id || item._id || item.productId;
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

      // Create order payload
      const orderPayload = {
        customerId: user?.id || null,
        items: orderItems,
        total: parseFloat(total.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        tax: 0,
        status: 'pending',
        paymentMethod: 'chapa',
        paymentStatus: 'pending',
        fullName: formData.fullName || 'Guest',
        email: formData.email || '',
        phone: formData.phone || '',
        city: formData.city || '',
        address: formData.address || '',
        additionalInfo: formData.isDelivery ? `Delivery to ${formData.city}, ${formData.address}` : 'Pickup',
        estimatedDelivery: formData.isDelivery ? '30-45 minutes' : '15-20 minutes',
        wantsReview: false
      };

      console.log('Creating order:', orderPayload);

      // Step 1: Try to create order in database
      const orderResponse = await api.post('/orders', orderPayload);

      if (!orderResponse || !orderResponse.data) {
        throw new Error('Failed to create order');
      }

      const createdOrder = {
        ...orderResponse.data,
        id: orderResponse.data.id || Date.now(),
        orderCode: orderResponse.data.orderCode || `ORD-${String(orderResponse.data.id || Date.now()).padStart(5, '0')}`,
      };

      console.log('Order created successfully:', createdOrder);

      // Save order to localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const nextOrders = [createdOrder, ...savedOrders.filter((entry) => String(entry.id) !== String(createdOrder.id))];
      localStorage.setItem('orders', JSON.stringify(nextOrders));

      // Step 2: Try to initialize Chapa payment
      // Validate required fields
      if (!total || isNaN(total) || total <= 0) {
        throw new Error('Invalid amount. Total must be a positive number.');
      }
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Invalid email address.');
      }

      const checkoutEmail = user?.email || formData.email;
      const checkoutName = user?.name || formData.fullName || 'Customer';
      const nameParts = checkoutName.trim().split(' ');
      const first_name = nameParts[0] || 'Customer';
      const last_name = nameParts.slice(1).join(' ') || '';

      const chapaPayload = {
        amount: parseFloat(total.toFixed(2)),
        currency: 'ETB',
        email: checkoutEmail,
        customer_email: checkoutEmail,
        first_name,
        last_name,
        tx_ref: createdOrder.orderCode || `TX-${Date.now()}`,
        orderId: createdOrder.id
      };

      console.log('Initializing Chapa payment:', chapaPayload);
      console.log('Total amount:', total, 'Type:', typeof total);

      const chapaResponse = await api.post('/payments/chapa/initiate', chapaPayload);

      console.log('Chapa response received:', chapaResponse.data);

      if (!chapaResponse.data || !chapaResponse.data.checkout_url) {
        throw new Error('Failed to initialize Chapa payment');
      }

      // Mark order success flow; do not open review modal before redirect
      setIsOrderSuccess(true);
      setIsLoading(false);

      // Step 3: Redirect to Chapa hosted payment page
      console.log('Redirecting to Chapa checkout:', chapaResponse.data.checkout_url);
      window.location.href = chapaResponse.data.checkout_url;

    } catch (error) {
      console.error('Chapa payment error:', error);
      console.error('Error response:', error.response?.data);
      let errMsg = 'Failed to initiate payment. Please try again.';

      // Extract error message safely, ensuring it's a string
      const errorData = error?.response?.data;

      if (errorData) {
        if (typeof errorData.message === 'string') {
          errMsg = errorData.message;
        } else if (typeof errorData.error === 'string') {
          errMsg = errorData.error;
        } else if (typeof errorData.suggestion === 'string') {
          errMsg = errorData.suggestion;
        } else if (typeof errorData === 'string') {
          errMsg = errorData;
        } else {
          // If it's an object, try to extract useful info
          errMsg = errorData.error || errorData.message || JSON.stringify(errorData);
        }
      } else if (error?.message && typeof error.message === 'string') {
        errMsg = error.message;
      }

      // Ensure errMsg is a string
      if (typeof errMsg !== 'string') {
        errMsg = String(errMsg);
      }

      setError(errMsg);
      setIsLoading(false);
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
      <Header pageType="checkout" />
      <div className={`${pageContainerClass} pt-24 pb-12 px-4 lg:px-8 flex items-start justify-center min-h-screen`}>
        <div className="max-w-7xl w-full mx-auto">
          {orderPlaced ? (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-10 text-center max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300">
                <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Check className="w-16 h-16" strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-6 text-lg">Thank you for your order. Your purchase has been confirmed.</p>
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
                <button
                  onClick={() => {
                    clearCart();
                    navigate('/');
                  }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Continue Shopping
                </button>
              </div>
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
              <div className="mb-10 text-center">
                <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">Checkout</h1>
                <p className={`${subTextClass}`}>Complete your order in a few simple steps</p>
              </div>

              {/* Centered Flex Container - Side by Side Cards */}
              <div className="flex flex-col lg:flex-row justify-center items-start gap-6 w-full mx-auto max-w-5xl">
                {/* Left Column: Main Form Card - Compact Width */}
                <div className="w-full lg:w-[480px]">
                  <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Combined Card: Contact & Delivery + Payment Method */}
                    <div className={`${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'} rounded-3xl shadow-sm p-10`}>
                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 mb-8 text-sm font-semibold ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors group`}
                      >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Cart</span>
                      </button>

                      {/* Contact & Delivery Section */}
                      <div className="mb-12">
                        <div className="mb-8">
                          <h3 className={`text-3xl font-black ${sectionTitleClass}`}>Contact & Delivery</h3>
                          <p className={`text-sm ${subTextClass} mt-1`}>Your information and delivery preferences</p>
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
                              <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                I need home delivery
                              </span>
                            </label>
                            {!formData.isDelivery && (
                              <p className="text-xs text-gray-600 mt-2 ml-8">
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
                                    <option value="Addis Ababa">Addis Ababa</option>
                                    <option value="Adama">Adama</option>
                                    <option value="Bahir Dar">Bahir Dar</option>
                                    <option value="Mekelle">Mekelle</option>
                                    <option value="Hawassa">Hawassa</option>
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

                      {/* Payment Method Section */}
                      <div className={`pt-12 border-t-2 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
                        <div className="mb-8">
                          <h3 className={`text-3xl font-black ${sectionTitleClass}`}>Payment Method</h3>
                          <p className={`text-sm ${subTextClass} mt-1`}>Choose how you'd like to pay</p>
                        </div>

                        <div className="space-y-4">
                          {[
                            { value: 'chapa', label: 'Pay with Chapa (Online Payment)', enabled: true },
                            { value: 'cash', label: 'Cash on Delivery', enabled: false },
                            { value: 'card', label: 'Credit/Debit Card', enabled: false },
                            { value: 'mobile', label: 'Mobile Payment (CBE Birr, Telebirr)', enabled: false }
                          ].map((method) => (
                            <div key={method.value} className="relative">
                              <label
                                className={`flex items-center gap-3 bg-transparent border-0 cursor-pointer group ${!method.enabled ? 'opacity-50' : ''}`}
                                onClick={(e) => {
                                  if (!method.enabled) {
                                    e.preventDefault();
                                    setComingSoonMessage(method.value);
                                    setTimeout(() => setComingSoonMessage(null), 3000);
                                  }
                                }}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={method.value}
                                  checked={formData.paymentMethod === method.value}
                                  onChange={handleInputChange}
                                  disabled={!method.enabled}
                                  className="w-5 h-5 text-emerald-600 border-2 border-gray-300 focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                                <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${method.enabled ? 'group-hover:text-emerald-600' : ''} transition-colors`}>
                                  {method.label}
                                </span>
                              </label>
                              {comingSoonMessage === method.value && !method.enabled && (
                                <div className="ml-8 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <span className="inline-block px-3 py-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                                    Coming Soon
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
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

                {/* Right Column: Order Summary Card - Sleek Narrow Width */}
                <div className="w-full lg:w-[340px]">
                  <div className={`${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'} rounded-3xl shadow-sm overflow-hidden sticky top-24`}>
                    <div className={`${summaryHeaderClass} py-2 px-6 h-12 flex items-center justify-between`}>
                      <div>
                        <h3 className="text-base font-black">Order Summary</h3>
                        <p className="text-emerald-100 text-[10px]">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                      </div>
                    </div>

                    <div className={`p-5 space-y-3 border-b-2 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} max-h-60 overflow-y-auto`}>
                      {cart.map(item => (
                        <div key={item._id} className={`${summaryRowClass} flex justify-between items-start p-3 rounded-lg transition-colors`}>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.quantity}x @ {formatPrice(item.price)} ETB</p>
                          </div>
                          <p className="font-black text-sm text-emerald-700">{formatPrice(item.price * item.quantity)} ETB</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-5 space-y-2 border-b-2 border-gray-200">
                      <div className={`flex justify-between text-sm ${subTextClass}`}>
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)} ETB</span>
                      </div>
                      <div className={`flex justify-between text-sm ${subTextClass}`}>
                        <span>Delivery</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)} ETB</span>
                      </div>
                    </div>

                    <div className={`p-6 ${totalBoxClass}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-black text-base`}>Total</span>
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text'} text-2xl font-black`}>{formatPrice(total)} ETB</span>
                      </div>

                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={isLoading}
                        className="w-full px-8 py-2.5 text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Order...</span>
                          </>
                        ) : (
                          <span>Place Order</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CustomerHeader from '../dashbord/customer/header/Header';
import api from '../../api';
import { ShoppingBag, Home, MapPin, Phone, CreditCard, Lock, Check, Truck, Wallet } from 'lucide-react';

const Checkout = () => {
  const { cart, cartCount, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    additionalInfo: '',
    paymentMethod: 'cash',
    saveInfo: false,
    isDelivery: true // true = delivery, false = pickup
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Safe price formatting function
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toFixed(2);
  };

  // Calculate subtotal with correct number handling (using cents to avoid floating point errors)
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate subtotal with correct number handling (using cents to avoid floating point errors)
      const subtotalCents = cart.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 0;
        return sum + Math.round(itemPrice * 100 * itemQty);
      }, 0);
      const subtotal = subtotalCents / 100;
      const deliveryFee = formData.isDelivery ? 50 : 0;
      const total = subtotal + deliveryFee;

      const orderPayload = {
        customerId: user?.id || null,
        items: cart,
        total,
        subtotal,
        deliveryFee,
        tax: Number((subtotal * 0.15).toFixed(2)),
        status: 'processing',
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'cash' ? 'unpaid' : 'paid',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        additionalInfo: formData.additionalInfo,
        vendor: cart[0]?.vendor || 'Fresh Farm',
        restaurant: cart[0]?.restaurant || 'Farm Market',
        estimatedDelivery: '30-45 minutes',
        specialInstructions: formData.specialInstructions || ''
      };

      const response = await api.post('/orders', orderPayload);
      const serverOrder = response.data;
      const orderData = {
        orderCode: serverOrder.orderCode,
        id: serverOrder.id,
        ...orderPayload,
        estimatedDelivery: serverOrder.estimatedDelivery,
        status: serverOrder.status,
        paymentStatus: serverOrder.paymentStatus,
        createdAt: serverOrder.createdAt,
      };

      console.log('Order submitted:', orderData);

      // Show success state
      setOrderPlaced(true);

      // Clear cart after delay
      setTimeout(() => {
        clearCart();
        navigate('/customer/dashboard/orders', { state: { orderSuccess: true } });
      }, 3000);

    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Order submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="text-7xl text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some delicious items to proceed to checkout</p>
          <button
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-1 transition-all"
            onClick={() => navigate('/customer/dashboard')}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} cartCount={cartCount} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {orderPlaced ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-10 text-center max-w-md mx-4 shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-4xl" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">Thank you for your order. Your food is being prepared.</p>
                <div className="text-left space-y-2 mb-6">
                  <p className="text-sm text-gray-700">
                    Order ID: <strong className="text-emerald-700">ORD-{Date.now().toString().slice(-8)}</strong>
                  </p>
                  <p className="text-sm text-gray-700">
                    Estimated delivery: <strong className="text-emerald-700">30-45 minutes</strong>
                  </p>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                    style={{ animation: 'progress 3s linear forwards' }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Redirecting to orders...</p>
              </div>
              <style>{`
                @keyframes progress {
                  from { width: 0; }
                  to { width: 100%; }
                }
              `}</style>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 mb-4">
                  <ShoppingBag className="text-emerald-600" />
                  Checkout
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    Cart
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    Details
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-7 h-7 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    Payment
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                  <form className="bg-white rounded-2xl shadow-xl p-8" onSubmit={handleSubmit}>
                    <div className="mb-10">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-5">
                        <Home className="text-emerald-600" />
                        Order Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-800 mb-1">Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-800 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            required
                            className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col mb-4">
                        <label className="text-sm font-medium text-gray-800 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                        />
                      </div>

                      {/* Small Checkbox for Delivery */}
                      <div className="flex items-center gap-2 mb-6">
                        <input
                          type="checkbox"
                          id="isDelivery"
                          name="isDelivery"
                          checked={formData.isDelivery}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="isDelivery" className="text-sm text-gray-600">
                          Delivery (check for delivery, uncheck for pickup)
                        </label>
                      </div>

                      {/* Conditional Address Fields for Delivery */}
                      {formData.isDelivery && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-800 mb-1">City *</label>
                              <select
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                              >
                                <option value="">Select City</option>
                                <option value="addis-ababa">Addis Ababa</option>
                                <option value="addama">Adama</option>
                                <option value="bahir-dar">Bahir Dar</option>
                                <option value="mekelle">Mekelle</option>
                                <option value="hawassa">Hawassa</option>
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-800 mb-1">Subcity *</label>
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="e.g., Bole, Kirkos, etc."
                                required
                                className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col mb-4">
                            <label className="text-sm font-medium text-gray-800 mb-1">Full Address *</label>
                            <textarea
                              name="additionalInfo"
                              value={formData.additionalInfo}
                              onChange={handleInputChange}
                              placeholder="House number, street, landmark..."
                              required
                              rows={3}
                              className="px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveInfo"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="saveInfo" className="text-sm text-gray-600">
                          Save this information for next time
                        </label>
                      </div>
                    </div>

                    <div className="mb-10">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-5">
                        <CreditCard className="text-emerald-600" />
                        Payment Method
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {['cash', 'card', 'mobile'].map((method) => (
                          <label
                            key={method}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-300 bg-white hover:border-emerald-300'
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
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {method === 'cash' ? 'Cash on Delivery' : method === 'card' ? 'Credit/Debit Card' : 'Mobile Payment'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {method === 'cash' ? 'Pay when you receive your order' : method === 'card' ? 'Pay securely with your card' : 'CBE Birr, Telebirr, etc.'}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                        <Lock className="text-emerald-600" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-800 rounded-xl font-bold hover:bg-gray-50 transition-all"
                        onClick={() => navigate(-1)}
                      >
                        Back to Cart
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet />
                            Place Order - {formatPrice(total)} ETB
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Order Summary Section */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-extrabold text-gray-800 mb-5">Order Summary</h3>

                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item._id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-semibold">{item.quantity}x</span>
                            <span className="text-sm text-gray-700">{formatPrice(item.price)} ETB</span>
                          </div>
                          <div className="font-bold text-gray-900 text-sm">
                            {formatPrice(item.price * item.quantity)} ETB
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-gray-300 my-5"></div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)} ETB</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(deliveryFee)} ETB</span>
                      </div>

                      <div className="h-px bg-gray-300 my-4"></div>

                      <div className="flex justify-between text-lg font-extrabold">
                        <span>Total Amount</span>
                        <span className="text-emerald-700">{formatPrice(total)} ETB</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 py-4 border-t border-gray-200">
                      {formData.isDelivery ? (
                        <>
                          <MapPin className="text-emerald-600 text-2xl" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Delivery Estimate</h4>
                            <p className="text-sm text-gray-600">30-45 minutes to {formData.city || 'your city'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="text-emerald-600 text-2xl" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Pickup Time</h4>
                            <p className="text-sm text-gray-600">Ready in 15-20 minutes</p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 py-3 text-sm text-gray-700 border-t border-gray-200">
                      <Check className="text-emerald-600" />
                      <span>100% Quality & Satisfaction Guarantee</span>
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

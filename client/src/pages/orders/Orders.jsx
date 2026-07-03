import React, { useState, useEffect } from 'react';
import CustomerHeader from '../dashbord/customer/header/Header';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Filter,
  RefreshCw,
  Store,
  Tag,
  ArrowLeft
} from 'lucide-react';

const Orders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    'on the way': '#8b5cf6'
  };

  const statusIcons = {
    pending: <Clock />,
    processing: <Package />,
    delivered: <CheckCircle />,
    cancelled: <Clock />,
    'on the way': <Truck />
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const serverOrders = response.data || [];
      const normalizedOrders = serverOrders.map(order => {
        const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
        return {
          ...order,
          orderNumber: order.orderCode || `ORD-${String(order.id).padStart(5, '0')}`,
          date: orderDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          timestamp: orderDate.toISOString(),
          status: order.status || 'processing',
          paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'unpaid' : 'paid'),
          items: order.items || [],
          vendor: order.vendor || 'Fresh Farm',
          fullName: order.fullName || user?.name || 'Customer'
        };
      });
      setOrders(normalizedOrders);
      localStorage.setItem('orders', JSON.stringify(normalizedOrders));
    } catch (error) {
      console.warn('Unable to load orders from server, falling back to localStorage', error);
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        localStorage.setItem('orders', JSON.stringify(mockOrders));
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        orderNumber: '#00123',
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date().toISOString(),
        status: 'processing',
        items: [
          { name: 'Margherita Pizza', quantity: 2, price: 280, image: '🍕' },
          { name: 'Caesar Salad', quantity: 1, price: 180, image: '🥗' },
          { name: 'Chocolate Brownie', quantity: 3, price: 120, image: '🍫' }
        ],
        total: 980,
        subtotal: 860,
        deliveryFee: 50,
        tax: 129,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Bole',
        additionalInfo: 'Bole Medhanialem, Street 123, House #45',
        paymentMethod: 'cash',
        estimatedDelivery: '30-45 minutes',
        restaurant: 'Pizza Palace',
        specialInstructions: 'Please add extra cheese'
      },
      {
        id: `ORD-${Date.now().toString().slice(-7)}`,
        orderNumber: '#00122',
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'on the way',
        items: [
          { name: 'Spaghetti Carbonara', quantity: 1, price: 220, image: '🍝' },
          { name: 'Garlic Bread', quantity: 2, price: 80, image: '🍞' }
        ],
        total: 460,
        subtotal: 380,
        deliveryFee: 50,
        tax: 57,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Kirkos',
        additionalInfo: 'Near Stadium, Building #12',
        paymentMethod: 'mobile',
        estimatedDelivery: '20-30 minutes',
        restaurant: 'Italian Bistro',
        specialInstructions: 'Less spicy please'
      },
      {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: '#00121',
        date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'cancelled',
        items: [
          { name: 'Burger Supreme', quantity: 1, price: 190, image: '🍔' },
          { name: 'French Fries', quantity: 1, price: 90, image: '🍟' },
          { name: 'Coca Cola', quantity: 2, price: 60, image: '🥤' }
        ],
        total: 460,
        subtotal: 400,
        deliveryFee: 0,
        tax: 60,
        fullName: 'John Doe',
        phone: '+251 91 234 5678',
        email: user?.email || 'john@example.com',
        city: 'Addis Ababa',
        address: 'Megenagna',
        additionalInfo: 'Mega Building, 3rd floor',
        paymentMethod: 'card',
        estimatedDelivery: '25-35 minutes',
        restaurant: 'Burger King',
        specialInstructions: 'No onions'
      }
    ];
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === filter.toLowerCase());

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'processing': return 'status-processing';
      case 'on the way': return 'status-ontheway';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const reorderItem = (order) => {
    // Implement reorder functionality
    console.log('Reordering:', order);
    alert(`Adding items from order ${order.orderNumber} to cart!`);
  };

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} />
      
      {/* Back to Home Button */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
      </div>

      <div className="min-h-screen bg-white py-0">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b-2 border-slate-100 gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-2xl sm:text-4xl font-black text-black">
                <Package className="w-8 sm:w-10 h-8 sm:h-10 text-emerald-600" /> My Orders
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base font-medium">Track and manage your orders</p>
            </div>

            <button 
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-transparent border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw className="w-5 h-5" /> Refresh
            </button>
          </div>

          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-5"></div>
              <p className="text-lg text-slate-600 font-medium">Loading your orders...</p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-8 gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    onClick={() => setFilter('delivered')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      filter === 'delivered'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> Delivered
                  </button>
                  <button
                    onClick={() => setFilter('on the way')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      filter === 'on the way'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Truck className="w-4 h-4" /> On the Way
                  </button>
                  <button
                    onClick={() => setFilter('processing')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all ${
                      filter === 'processing'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Package className="w-4 h-4" /> Processing
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-lg px-4 py-2.5">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="border-none bg-transparent text-base text-black font-medium cursor-pointer outline-none min-w-[150px]"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="on the way">On the Way</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                // Empty State
                <div className="text-center py-20 px-4">
                  <Package className="w-20 h-20 mx-auto mb-6 text-slate-300" />
                  <h2 className="text-2xl font-bold text-black mb-3">No orders found</h2>
                  <p className="text-slate-600 mb-8 text-lg">
                    You haven't placed any orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}
                  </p>
                  <button 
                    onClick={() => window.location.href = '/customer/dashboard'}
                    className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id} 
                      className={`border border-slate-200 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                        expandedOrder === order.id ? 'shadow-xl' : 'shadow-md'
                      }`}
                    >
                      {/* Order Summary */}
                      <div 
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                              <h3 className="text-2xl font-black text-black">{order.orderNumber}</h3>
                              <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Calendar className="w-4 h-4 text-emerald-600" />
                                <span>{order.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                              <Store className="w-4 h-4 text-amber-500" />
                              <span>{order.restaurant}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border ${
                              order.status.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              order.status.toLowerCase() === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              order.status.toLowerCase() === 'on the way' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              order.status.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              order.status.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {statusIcons[order.status.toLowerCase()] || <Clock className="w-4 h-4" />}
                              <span>{order.status}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-600 text-xs sm:text-sm">Total:</p>
                              <p className="text-xl sm:text-2xl font-black text-black">{formatPrice(order.total)} ETB</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Preview Items */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex gap-3 flex-wrap items-center">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={`${order.id}-preview-${idx}`} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg text-sm">
                                {typeof item.image === 'string' && item.image.trim() !== '' && item.image.startsWith('http') ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-6 h-6 rounded object-cover"
                                  />
                                ) : (
                                  <span className="text-base">{item.image || '🛒'}</span>
                                )}
                                <span className="text-black font-medium">{item.name}</span>
                                <span className="text-slate-600 font-semibold">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-emerald-600 font-semibold text-sm">+{order.items.length - 2} more items</p>
                            )}
                          </div>
                          <div className="text-emerald-600 font-bold text-lg">
                            {expandedOrder === order.id ? '▲' : '▼'}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === order.id && (
                        <div className="px-6 py-6 border-t border-slate-100 bg-slate-50 animate-slideDown">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Order Items Detail */}
                            <div>
                              <h4 className="flex items-center gap-2 text-xl font-bold text-black mb-6">
                                <Package className="w-5 h-5 text-emerald-600" /> Order Details
                              </h4>
                              <div className="space-y-4 mb-6">
                                {order.items.map((item, idx) => (
                                  <div key={`${order.id}-full-${idx}`} className="flex justify-between items-center p-4 hover:bg-white rounded-lg transition-colors">
                                    <div className="flex items-center gap-4">
                                      {typeof item.image === 'string' && item.image.trim() !== '' && item.image.startsWith('http') ? (
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-16 h-16 rounded-xl object-cover"
                                        />
                                      ) : (
                                        <span className="text-4xl">{item.image || '🛒'}</span>
                                      )}
                                      <div>
                                        <h5 className="font-semibold text-black text-base mb-1">{item.name}</h5>
                                        <p className="text-slate-600 text-sm">{item.price} ETB each</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1">
                                        x{item.quantity}
                                      </div>
                                      <p className="font-bold text-black text-lg">{formatPrice(item.price * item.quantity)} ETB</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Breakdown */}
                              <div className="bg-slate-100 rounded-lg p-5 space-y-3">
                                <div className="flex justify-between text-slate-700">
                                  <span>Subtotal</span>
                                  <span>{formatPrice(order.subtotal)} ETB</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                  <span>Delivery Fee</span>
                                  <span className={order.deliveryFee === 0 ? 'text-emerald-600 font-semibold' : ''}>
                                    {order.deliveryFee === 0 ? 'FREE' : `${formatPrice(order.deliveryFee)} ETB`}
                                  </span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                  <span>Tax (15%)</span>
                                  <span>{formatPrice(order.tax)} ETB</span>
                                </div>
                                <div className="flex justify-between border-t-2 border-slate-200 pt-3 text-black">
                                  <span className="font-bold">Total</span>
                                  <span className="text-2xl font-black">{formatPrice(order.total)} ETB</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Information */}
                            <div>
                              <h4 className="flex items-center gap-2 text-xl font-bold text-black mb-6">
                                <MapPin className="w-5 h-5 text-emerald-600" /> Delivery Information
                              </h4>
                              <div className="bg-slate-100 rounded-lg p-5 space-y-5">
                                <div className="flex gap-4">
                                  <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                  <div>
                                    <p className="font-bold text-black mb-1">Address:</p>
                                    <p className="text-slate-600 text-sm leading-relaxed">{order.additionalInfo}</p>
                                    <p className="text-slate-600 text-sm">{order.address}, {order.city}</p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                  <div>
                                    <p className="font-bold text-black mb-1">Phone:</p>
                                    <p className="text-slate-600 text-sm">{order.phone}</p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                  <div>
                                    <p className="font-bold text-black mb-1">Email:</p>
                                    <p className="text-slate-600 text-sm">{order.email}</p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                                  <div>
                                    <p className="font-bold text-black mb-1">Payment Method:</p>
                                    <p className="text-blue-600 font-semibold text-sm">
                                      {order.paymentMethod === 'cash' ? 'Cash on Delivery' :
                                        order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                                          'Mobile Payment'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {order.specialInstructions && (
                                <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                  <h5 className="font-bold text-amber-900 mb-2">Special Instructions</h5>
                                  <p className="text-amber-800 text-sm">{order.specialInstructions}</p>
                                </div>
                              )}

                              <div className="mt-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg flex gap-3">
                                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="font-bold text-black mb-1">Estimated Delivery Time</h5>
                                  <p className="text-slate-600 text-sm">{order.estimatedDelivery}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-4 flex-col sm:flex-row pt-6 border-t border-slate-200">
                            <button 
                              onClick={() => reorderItem(order)}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                              <Tag className="w-4 h-4" /> Reorder
                            </button>
                            <button className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                              Get Help
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12">
                <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <h4 className="text-slate-600 font-semibold mb-3">Total Orders</h4>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {orders.length}
                  </p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <h4 className="text-slate-600 font-semibold mb-3">Total Spent</h4>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))} ETB
                  </p>
                </div>
                <div className="border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <h4 className="text-slate-600 font-semibold mb-3">Avg. Order Value</h4>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {orders.length > 0 ? formatPrice(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : 0} ETB
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Orders;
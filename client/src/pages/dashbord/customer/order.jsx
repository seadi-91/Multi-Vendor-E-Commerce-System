import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../../api';

const MyOrders = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const products = [
    { id: 1, name: 'Organic Tomatoes', description: 'Fresh organic tomatoes from local farms', price: 4.99, rating: 4.5, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', reviewsCount: 382, discountPercent: 20, unit: 'kg', freeShipping: true, badge: 'Top Pick', category: 'Vegetables' },
    { id: 2, name: 'Fresh Potatoes', description: 'Premium quality potatoes, perfect for cooking', price: 3.49, rating: 4.8, vendor: 'Valley Harvest', vendorVerified: true, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', reviewsCount: 145, discountPercent: 18, unit: 'kg', category: 'Vegetables' },
    { id: 3, name: 'Fresh Bell Peppers', description: 'Spicy and fresh peppers for your dishes', price: 5.99, rating: 4.0, vendor: 'Mountain Orchard', vendorVerified: true, image: 'https://images.unsplash.com/photo-1563565080-749774653557?w=600&q=80', reviewsCount: 612, discountPercent: 20, unit: 'kg', freeShipping: true, badge: 'Best Seller', category: 'Vegetables' },
    { id: 4, name: 'Fresh Spinach', description: 'Crisp and nutritious leafy greens', price: 2.99, rating: 4.7, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', reviewsCount: 98, discountPercent: 20, unit: 'bunch', category: 'Vegetables' },
    { id: 5, name: 'Organic Broccoli', description: 'Garden-fresh broccoli heads', price: 3.99, rating: 4.5, vendor: 'Green Farms', vendorVerified: true, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80', reviewsCount: 220, discountPercent: 12, unit: 'bunch', category: 'Vegetables' },
    { id: 6, name: 'Fresh Strawberries', description: 'Sun-ripened sweet strawberries', price: 6.49, rating: 4.8, vendor: 'Berryland Farms', vendorVerified: false, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', reviewsCount: 450, discountPercent: 18, unit: 'pack', freeShipping: true, category: 'Fruits' },
    { id: 7, name: 'Organic Avocados', description: 'Creamy ripe avocados from sunny farms', price: 7.99, rating: 4.7, vendor: 'Sunny Valley', vendorVerified: true, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80', reviewsCount: 180, discountPercent: 15, unit: 'pack', badge: 'New', category: 'Fruits' },
    { id: 8, name: 'Organic Apples', description: 'Crisp and sweet apples from mountain orchards', price: 5.49, rating: 4.9, vendor: 'Mountain Orchard', vendorVerified: true, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80', reviewsCount: 612, discountPercent: 25, unit: 'kg', freeShipping: true, category: 'Fruits' },
  ];

  const statusColors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    'on the way': '#8b5cf6'
  };

  const getStatusColor = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    return statusColors[normalizedStatus] || '#6b7280';
  };

  const paymentStatusColors = {
    paid: '#10b981',
    unpaid: '#f59e0b'
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const normalizedPaymentStatus = (paymentStatus || 'unpaid').toLowerCase();
    return paymentStatusColors[normalizedPaymentStatus] || '#6b7280';
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
        const date = orderDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const time = orderDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          id: order.id,
          orderNumber: order.orderCode || `ORD-${String(order.id).padStart(5, '0')}`,
          date,
          time,
          timestamp: order.createdAt || new Date().toISOString(),
          status: order.status || 'processing',
          paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'unpaid' : 'paid'),
          items: order.items || [],
          total: order.total || 0,
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || 0,
          fullName: order.fullName || user?.name || 'Customer',
          phone: order.phone || '',
          email: order.email || user?.email || '',
          city: order.city || '',
          address: order.address || '',
          additionalInfo: order.additionalInfo || '',
          paymentMethod: order.paymentMethod || 'cash',
          estimatedDelivery: order.estimatedDelivery || '30-45 minutes',
          vendor: order.vendor || 'Fresh Farm',
          specialInstructions: order.specialInstructions || ''
        };
      });
      setOrders(normalizedOrders);
      localStorage.setItem('orders', JSON.stringify(normalizedOrders));
    } catch (error) {
      console.warn('Unable to load orders from server, falling back to localStorage', error);
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
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
          day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date().toISOString(),
        status: 'processing',
        paymentStatus: 'unpaid',
        items: [
          { ...products[0], quantity: 2, _id: products[0].id },
          { ...products[6], quantity: 1, _id: products[6].id }
        ],
        total: 2 * products[0].price + products[6].price,
        subtotal: 2 * products[0].price + products[6].price,
        deliveryFee: 0,
        fullName: user?.name || 'Selam',
        phone: '+251 91 234 5678',
        email: user?.email || 'selam@example.com',
        city: 'Addis Ababa',
        address: 'Bole',
        additionalInfo: 'Bole Medhanialem, Street 123, House #45',
        paymentMethod: 'cash',
        estimatedDelivery: '30-45 minutes',
        vendor: 'Green Farms',
        specialInstructions: 'Please leave at front desk'
      },
      {
        id: `ORD-${Date.now().toString().slice(-7)}`,
        orderNumber: '#00122',
        date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: new Date(Date.now() - 86400000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'delivered',
        paymentStatus: 'paid',
        items: [
          { ...products[5], quantity: 1, _id: products[5].id },
          { ...products[7], quantity: 2, _id: products[7].id }
        ],
        total: products[5].price + 2 * products[7].price,
        subtotal: products[5].price + 2 * products[7].price,
        deliveryFee: 50,
        fullName: user?.name || 'Selam',
        phone: '+251 91 234 5678',
        email: user?.email || 'selam@example.com',
        city: 'Addis Ababa',
        address: 'Kirkos',
        additionalInfo: 'Near Stadium, Building #12',
        paymentMethod: 'mobile',
        estimatedDelivery: '20-30 minutes',
        vendor: 'Berryland Farms',
        specialInstructions: ''
      }
    ];
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => {
      const orderStatus = (order.status || '').toLowerCase();
      const filterStatus = filter.toLowerCase();
      return orderStatus === filterStatus;
    });

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const reorderItem = (order) => {
    if (order.paymentStatus === 'paid') {
      toast.error('Cannot reorder paid orders');
      return;
    }
    if (!order.items || order.items.length === 0) {
      toast.error('No items to reorder');
      return;
    }
    order.items.forEach(item => {
      addToCart({
        ...item,
        _id: item.id || item._id || `${Date.now()}-${Math.random()}`
      });
    });
    toast.success('Items added to cart!');
    navigate('/customer/cart');
  };

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-6 shadow-xl shadow-emerald-200">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-green-700 bg-clip-text text-transparent mb-4">
            My Orders
          </h1>
          <p className="text-gray-600 text-xl max-w-md mx-auto">Track your orders and view detailed receipts for all your purchases</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['all', 'pending', 'processing', 'on the way', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-7 py-3.5 rounded-full text-sm font-black uppercase tracking-wide transition-all duration-500
                ${filter === status
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-300 transform scale-110'
                  : 'bg-white text-gray-700 border-3 border-gray-200 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-2xl hover:shadow-emerald-100'
                }
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${orders.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-bounce w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-6 flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-4xl">⏳</span>
            </div>
            <p className="text-gray-600 text-xl font-semibold tracking-wide">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-24 bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl border border-green-100">
            <div className="text-9xl mb-8 opacity-50">🛒</div>
            <h3 className="text-3xl font-black text-gray-800 mb-6">
              No orders found
            </h3>
            <p className="text-gray-600 text-lg mb-10 max-w-lg mx-auto">
              {filter !== 'all' ? `You have no orders with status "${filter}"` : 'Start shopping to see your orders here!'}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-emerald-300 hover:-translate-y-2 transition-all duration-300"
            >
              🍎 Start Shopping Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 transform hover:-translate-y-1"
              >
                {/* Order Card Header */}
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap mb-4">
                        <h3 className="text-3xl font-black text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${getStatusColor(order.status)}20`,
                            color: getStatusColor(order.status),
                            border: `2px solid ${getStatusColor(order.status)}40`
                          }}
                        >
                          <span
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          ></span>
                          {order.status}
                        </span>
                        <span
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}20`,
                            color: getPaymentStatusColor(order.paymentStatus),
                            border: `2px solid ${getPaymentStatusColor(order.paymentStatus)}40`
                          }}
                        >
                          {order.paymentStatus === 'paid' ? '✓ Paid' : '○ Not Paid'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-5 text-base text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-500 text-xl">📅</span>
                          <span className="font-semibold">{order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-teal-500 text-xl">⏰</span>
                          <span className="font-semibold">{order.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 text-xl">🏪</span>
                          <span className="font-semibold">{order.vendor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Total</p>
                      <p className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                        ${formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Receipt */}
                {expandedOrder === order.id && (
                  <div className="border-t-2 border-dashed border-gray-300 bg-gradient-to-b from-gray-50 to-white px-8 pb-8">
                    <div className="max-w-md mx-auto mt-8 bg-white rounded-3xl p-8 shadow-2xl border border-emerald-100">
                      <div className="text-center border-b-3 border-dashed border-gray-300 pb-6 mb-6">
                        <div className="text-5xl mb-3">🌱</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">FARM CONNECT</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-[0.3em]">
                          Receipt {order.orderNumber}
                        </p>
                      </div>
                      <div className="space-y-2 mb-6 text-sm text-gray-700">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="font-semibold text-gray-500">Customer:</span>
                          <span className="font-bold text-gray-900">{order.fullName}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                          <span className="font-semibold text-gray-500">Date:</span>
                          <span className="font-bold text-gray-900">{order.date}</span>
                        </div>
                      </div>
                      <div className="border-y-3 border-dashed border-gray-300 py-5 mb-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2 text-sm">
                            <span className="text-gray-800 font-semibold">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-black text-gray-900 text-lg">
                              ${formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mb-6">
                        <div className="flex justify-between pt-3 border-t-3 border-dashed border-gray-300 text-xl font-black text-gray-900">
                          <span className="uppercase tracking-wide">Total</span>
                          <span className="text-emerald-700">${formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="border-t-2 border-gray-200 pt-4 text-sm text-gray-600 flex justify-between">
                        <span className="font-semibold">Payment: {order.paymentMethod === 'cash' ? 'Cash' : 'Online'}</span>
                        <span
                          className="font-black uppercase tracking-wider"
                          style={{ color: getPaymentStatusColor(order.paymentStatus) }}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="mt-8 flex gap-3">
                        {order.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => reorderItem(order)}
                            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                          >
                            Reorder
                          </button>
                        )}
                        <button className="flex-1 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-gray-100 transition-all duration-300">
                          Help
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

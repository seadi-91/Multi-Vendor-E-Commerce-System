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
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);

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

  const viewReceipt = (order) => {
    setCurrentReceiptOrder(order);
    setReceiptModalOpen(true);
  };

  const printReceipt = () => {
    window.print();
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
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-content, 
          #receipt-content * {
            visibility: visible !important;
          }
          #receipt-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 400px !important;
            margin: 20px auto !important;
            padding: 15px !important;
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: auto;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
              <span className="text-xl">📦</span>
              My Orders
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'pending', 'processing', 'on the way', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-semibold transition-all
                    ${filter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500 hover:text-green-700'
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' && ` (${orders.length})`}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-3xl mb-3">⏳</div>
              <p className="text-gray-600 text-xs font-semibold">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-5xl mb-4 opacity-50">🛒</div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 text-xs mb-6 max-w-sm mx-auto">
                {filter !== 'all' ? `You have no orders with status "${filter}"` : 'Start shopping to see your orders here!'}
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-xs hover:bg-green-700 transition-all"
              >
                🍎 Start Shopping Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Order Card Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-base font-bold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${getStatusColor(order.status)}15`,
                              color: getStatusColor(order.status),
                              border: `1px solid ${getStatusColor(order.status)}30`
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            ></span>
                            {order.status}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}15`,
                              color: getPaymentStatusColor(order.paymentStatus),
                              border: `1px solid ${getPaymentStatusColor(order.paymentStatus)}30`
                            }}
                          >
                            {order.paymentStatus === 'paid' ? '✓ Paid' : '○ Not Paid'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-600 text-base">📅</span>
                            <span className="font-medium">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-600 text-base">⏰</span>
                            <span className="font-medium">{order.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center md:text-right flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Total</p>
                          <p className="text-lg font-bold text-green-700">
                            ${formatPrice(order.total)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewReceipt(order);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-all"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Receipt Preview */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-200 bg-gray-50 px-4 pb-4">
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">Items</h4>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-1.5 text-xs">
                            <span className="text-gray-800 font-medium">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">
                              ${formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        {order.paymentStatus !== 'paid' && (
                          <button
                            onClick={() => reorderItem(order)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-xs hover:bg-green-700 transition-all"
                          >
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptModalOpen && currentReceiptOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 no-print overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden my-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between no-print sticky top-0 bg-white">
              <h3 className="text-sm font-bold text-gray-900">Receipt - {currentReceiptOrder.orderNumber}</h3>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]" id="receipt-content">
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm mx-auto mb-2">
                  <span className="text-white text-xl">🌾</span>
                </div>
                <h2 className="text-sm font-bold text-gray-900 mb-1">FarmConnect</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Receipt {currentReceiptOrder.orderNumber}
                </p>
              </div>
              
              <div className="space-y-1 mb-3 text-[10px] text-gray-700">
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="font-medium text-gray-500">Customer:</span>
                  <span className="font-semibold text-gray-900">{currentReceiptOrder.fullName}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="font-medium text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-900">{currentReceiptOrder.date}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="font-medium text-gray-500">Email:</span>
                  <span className="font-semibold text-gray-900">{currentReceiptOrder.email}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                  <span className="font-medium text-gray-500">Phone:</span>
                  <span className="font-semibold text-gray-900">{currentReceiptOrder.phone}</span>
                </div>
                {currentReceiptOrder.address && (
                  <div className="flex justify-between items-center py-0.5 border-b border-gray-100">
                    <span className="font-medium text-gray-500">Address:</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">{currentReceiptOrder.address}, {currentReceiptOrder.city}</span>
                  </div>
                )}
              </div>
              
              <div className="border-y border-dashed border-gray-300 py-2 mb-3">
                {currentReceiptOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-[10px]">
                    <span className="text-gray-800 font-medium">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-gray-900 text-[10px]">
                      ${formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between pt-1 border-t border-dashed border-gray-300 text-xs font-bold text-gray-900">
                  <span>Subtotal</span>
                  <span>${formatPrice(currentReceiptOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-[10px] font-medium text-gray-700">
                  <span>Delivery Fee</span>
                  <span>${formatPrice(currentReceiptOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 text-sm font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-green-700">${formatPrice(currentReceiptOrder.total)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-600 flex justify-between items-center">
                <span className="font-medium">Payment: {currentReceiptOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : currentReceiptOrder.paymentMethod === 'card' ? 'Credit Card' : 'Mobile Payment'}</span>
                <span
                  className="font-bold uppercase tracking-wide"
                  style={{ color: getPaymentStatusColor(currentReceiptOrder.paymentStatus) }}
                >
                  {currentReceiptOrder.paymentStatus}
                </span>
              </div>
              
              <div className="mt-3 pt-2 border-t border-dashed border-gray-300 text-center text-[10px] text-gray-500">
                <p>Thank you for your purchase!</p>
                <p className="mt-0.5">Estimated Delivery: {currentReceiptOrder.estimatedDelivery}</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3 no-print">
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-1.5"
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyOrders;

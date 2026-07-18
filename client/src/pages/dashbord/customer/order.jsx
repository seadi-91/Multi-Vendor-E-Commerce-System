import React, { useState, useEffect } from 'react';
import Footer from '../../../components/Footer';
import Header from '../../../components/Header';
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
  // State for per-product review forms: { orderId: { productId: { isEditing: bool, rating: num, comment: string } } }
  const [productReviewForms, setProductReviewForms] = useState({});
  const [submittingProduct, setSubmittingProduct] = useState(null); // { orderId, productId } to track which is being submitted

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
          orderItems: order.orderItems || [],
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
          specialInstructions: order.specialInstructions || '',
          wantsReview: order.wantsReview || false,
          reviews: order.reviews || []
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
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

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
      return;
    }
    if (!order.items || order.items.length === 0) {
      return;
    }
    order.items.forEach(item => {
      addToCart({
        ...item,
        _id: item.id || item._id || `${Date.now()}-${Math.random()}`
      });
    });
    navigate('/customer/cart');
  };

  const toggleReviewForm = (orderId, productId) => {
    setProductReviewForms(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [productId]: {
          isEditing: !prev[orderId]?.[productId]?.isEditing,
          rating: prev[orderId]?.[productId]?.rating || 5,
          comment: prev[orderId]?.[productId]?.comment || ''
        }
      }
    }));
  };

  const handleProductReviewChange = (orderId, productId, field, value) => {
    setProductReviewForms(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [productId]: {
          ...prev[orderId]?.[productId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmitProductReview = async (orderId, productId, item) => {
    const formData = productReviewForms[orderId]?.[productId];
    if (!formData) return;

    setSubmittingProduct({ orderId, productId });
    try {
      const response = await api.post('/reviews', {
        productId,
        orderId,
        rating: formData.rating,
        comment: formData.comment.trim()
      });

      // Update local state to reflect the new review
      setOrders(prevOrders => prevOrders.map(o => {
        if (o.id !== orderId) return o;
        const updatedOrderItems = o.orderItems.map(oi => {
          if (oi.productId !== productId) return oi;
          return { ...oi, review: response.data.data };
        });
        return {
          ...o,
          orderItems: updatedOrderItems,
          reviews: [...(o.reviews || []), response.data.data]
        };
      }));

      // Close the form
      toggleReviewForm(orderId, productId);
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingProduct(null);
    }
  };

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return numPrice.toFixed(2);
  };

  const formatReviewDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStarRating = (rating, isEditable, onRatingChange) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => isEditable && onRatingChange(star)}
            className={`${isEditable ? 'cursor-pointer hover:text-yellow-500' : 'cursor-default'
              } text-xl`}
            disabled={!isEditable}
          >
            <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
              ★
            </span>
          </button>
        ))}
      </div>
    );
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

      <Header pageType="orders" />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-4 sm:py-6 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between gap-2 text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">📦</span>
                My Orders
              </div>
              {/* Filter Controls - Compact */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'pending', 'processing', 'on the way', 'delivered', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`
                      px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap
                      ${filter === status
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:text-green-700 dark:hover:text-green-400'
                      }
                    `}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status === 'all' && ` (${orders.length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">⏳</div>
              <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium">Loading your orders...</p>
            </div>
          ) : (() => {
            const filteredOrders = filter === 'all'
              ? orders
              : orders.filter(order => {
                const orderStatus = (order.status || '').toLowerCase();
                const filterStatus = filter.toLowerCase();
                return orderStatus === filterStatus;
              });

            if (filteredOrders.length === 0) {
              return (
                <div className="text-center py-8 sm:py-12 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-50">🛒</div>
                  <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
                    No orders found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mb-4 sm:mb-6 max-w-sm mx-auto">
                    {filter !== 'all' ? `You have no orders with status "${filter}"` : 'Start shopping to see your orders here!'}
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg sm:rounded-xl font-semibold text-[10px] sm:text-xs hover:bg-green-700 transition-all"
                  >
                    🍎 Start Shopping Now
                  </Link>
                </div>
              );
            }

            return (
              <div className="space-y-2 sm:space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                  >
                    {/* Order Card Header */}
                    <div
                      className="p-2.5 sm:p-4 cursor-pointer"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1.5 sm:mb-2">
                            <h3 className="text-xs sm:text-base font-bold text-gray-900 dark:text-white">
                              {order.orderNumber}
                            </h3>
                            <span
                              className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium"
                              style={{
                                backgroundColor: `${getStatusColor(order.status)}15`,
                                color: getStatusColor(order.status),
                                border: `1px solid ${getStatusColor(order.status)}30`
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                              ></span>
                              {order.status}
                            </span>
                            <span
                              className="inline-flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium"
                              style={{
                                backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}15`,
                                color: getPaymentStatusColor(order.paymentStatus),
                                border: `1px solid ${getPaymentStatusColor(order.paymentStatus)}30`
                              }}
                            >
                              {order.paymentStatus === 'paid' ? '✓ Paid' : '○ Not Paid'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="text-green-600 text-sm sm:text-base">📅</span>
                              <span className="font-medium">{order.date}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="text-green-600 text-sm sm:text-base">⏰</span>
                              <span className="font-medium">{order.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-center md:text-right flex items-center gap-2 sm:gap-4">
                          <div>
                            <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-0.5 sm:mb-1">Total</p>
                            <p className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-500">
                              ${formatPrice(order.total)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewReceipt(order);
                            }}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-500 border border-green-200 dark:border-green-800 rounded-md sm:rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    {expandedOrder === order.id && (
                      <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-2.5 sm:px-4 pb-2.5 sm:pb-4">
                        <div className="mt-2 sm:mt-4 space-y-3 sm:space-y-4">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">Items</h4>

                          {/* Render each item */}
                          {(order.orderItems?.length ? order.orderItems : order.items).map((item, idx) => {
                            const productId = item.productId || item.id || item._id;
                            const existingReview = item.review;
                            const isOrderDelivered = order.status?.toLowerCase() === 'delivered';
                            const isSubmittingThisProduct =
                              submittingProduct?.orderId === order.id &&
                              submittingProduct?.productId === productId;
                            const formData = productReviewForms[order.id]?.[productId];
                            const isReviewFormOpen = formData?.isEditing;

                            return (
                              <div
                                key={idx}
                                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 sm:p-4"
                              >
                                {/* Product Info */}
                                <div className="flex items-start gap-3 sm:gap-4">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {item.name} x{item.quantity}
                                      </h5>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        ${formatPrice(item.price * item.quantity)}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      ${formatPrice(item.price)} each
                                    </p>

                                    {/* Review Section */}
                                    {isOrderDelivered && (
                                      <div className="mt-3">
                                        {/* Existing Review */}
                                        {existingReview ? (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                                Reviewed
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {renderStarRating(existingReview.rating, false)}
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatReviewDate(existingReview.createdAt)}
                                              </span>
                                            </div>
                                            {existingReview.comment && (
                                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                {existingReview.comment}
                                              </p>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            {/* Review Form Toggle */}
                                            {!isReviewFormOpen ? (
                                              <button
                                                type="button"
                                                onClick={() => toggleReviewForm(order.id, productId)}
                                                className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800 rounded-md px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                              >
                                                Rate Product
                                              </button>
                                            ) : (
                                              <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-2">
                                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Rating</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleReviewForm(order.id, productId)}
                                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                                {renderStarRating(
                                                  formData?.rating || 5,
                                                  true,
                                                  (newRating) => handleProductReviewChange(order.id, productId, 'rating', newRating)
                                                )}
                                                <div>
                                                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                                    Review (Optional)
                                                  </label>
                                                  <textarea
                                                    value={formData?.comment || ''}
                                                    onChange={(e) => handleProductReviewChange(order.id, productId, 'comment', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    placeholder="Share your experience..."
                                                    rows={3}
                                                  />
                                                </div>
                                                <div className="flex justify-end">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleSubmitProductReview(order.id, productId, item)}
                                                    disabled={isSubmittingThisProduct}
                                                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-md font-semibold text-xs hover:bg-emerald-700 disabled:opacity-70 transition-all flex items-center gap-2"
                                                  >
                                                    {isSubmittingThisProduct ? (
                                                      <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                                                    ) : 'Submit Review'}
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 sm:mt-4 flex gap-2">
                          {order.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => reorderItem(order)}
                              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-md sm:rounded-lg font-semibold text-[10px] sm:text-xs hover:bg-green-700 transition-all"
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
            );
          })()}
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
                {(currentReceiptOrder.orderItems?.length ? currentReceiptOrder.orderItems : currentReceiptOrder.items).map((item, idx) => (
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
      <Footer />
    </>
  );
};

export default MyOrders;

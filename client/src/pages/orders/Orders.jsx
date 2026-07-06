import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  ArrowLeft,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const Orders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const ThemeToggle = () => {
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
        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
          <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-slate-900 hover:bg-slate-100">
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-slate-900 hover:bg-slate-100">
            <Moon className="mr-2 h-4 w-4 text-amber-500" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-slate-900 hover:bg-slate-100">
            <Monitor className="mr-2 h-4 w-4 text-amber-500" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

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

  useEffect(() => {
    if (location.state?.latestOrder) {
      setOrders(prev => {
        const exists = prev.some(entry => String(entry.id) === String(location.state.latestOrder.id));
        return exists ? prev : [location.state.latestOrder, ...prev];
      });
    }
  }, [location.state?.latestOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const serverOrders = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');

      const normalizeOrder = (order) => {
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
          items: Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []),
          vendor: order.vendor || 'Fresh Farm',
          fullName: order.fullName || user?.name || 'Customer'
        };
      };

      const normalizedServerOrders = serverOrders.map(normalizeOrder);
      const normalizedSavedOrders = savedOrders.map(normalizeOrder);
      const mergedOrders = [...normalizedSavedOrders, ...normalizedServerOrders.filter(serverOrder => !normalizedSavedOrders.some(savedOrder => String(savedOrder.id) === String(serverOrder.id)))];
      const filteredOrders = mergedOrders.filter(order => {
        const matchesCustomerId = user?.id && order.customerId ? Number(order.customerId) === Number(user.id) : false;
        const matchesEmail = user?.email && order.email ? String(order.email).toLowerCase() === String(user.email).toLowerCase() : false;
        const matchesName = user?.name && order.fullName ? String(order.fullName).toLowerCase() === String(user.name).toLowerCase() : false;
        return matchesCustomerId || matchesEmail || matchesName || (!order.customerId && !order.email && !order.fullName);
      });

      const finalOrders = filteredOrders.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      setOrders(finalOrders);
      localStorage.setItem('orders', JSON.stringify(finalOrders));
    } catch (error) {
      console.warn('Unable to load orders from server', error);
      setOrders([]);
      localStorage.setItem('orders', JSON.stringify([]));
    } finally {
      setLoading(false);
    }
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
    console.log('Reordering:', order);
    alert(`Adding items from order ${order.orderNumber} to cart!`);
  };

  const viewReceipt = (order) => {
    navigate(`/customer/orders/receipt/${order.id || order.orderNumber}`, { state: { order } });
  };

  const pageContainerClass = theme === 'dark'
    ? 'min-h-screen bg-slate-950 text-white'
    : theme === 'light'
      ? 'min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-slate-900'
      : 'min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-slate-900';
  const cardClass = theme === 'dark'
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-gray-200 text-slate-900';
  const headerClass = theme === 'dark'
    ? 'bg-slate-900/90 text-white border-slate-800'
    : 'bg-white/80 text-slate-900 border-gray-200';
  const secondaryTextClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const mutedCardClass = theme === 'dark' ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900';

  return (
    <div className={pageContainerClass}>
      {/* Header */}
      <header className={`${headerClass} backdrop-blur-md sticky top-0 z-40 border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>My Orders</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition duration-200 hover:bg-emerald-600 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className={cardClass}>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Visible Orders</p>
              <p className="mt-3 text-3xl font-black">{filteredOrders.length}</p>
              <p className={`mt-1 text-sm ${secondaryTextClass}`}>Orders matching your current view</p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Total Spent</p>
              <p className="mt-3 text-3xl font-black">{formatPrice(orders.reduce((sum, order) => sum + order.total, 0))} ETB</p>
              <p className={`mt-1 text-sm ${secondaryTextClass}`}>Across all orders</p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">Average Order</p>
              <p className="mt-3 text-3xl font-black">{orders.length > 0 ? formatPrice(orders.reduce((sum, order) => sum + order.total, 0) / orders.length) : 0} ETB</p>
              <p className={`mt-1 text-sm ${secondaryTextClass}`}>Order value over time</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-5"></div>
            <p className={`text-lg ${secondaryTextClass} font-medium`}>Loading your orders...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-emerald-600" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[200px] bg-white border-gray-200">
                    <SelectValue placeholder="Filter orders" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-lg">
                    <SelectItem value="all">All Orders ({orders.length})</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="on the way">On the Way</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <Card className={cardClass}>
                <CardContent className="text-center py-20 px-4">
                  <Package className="w-20 h-20 mx-auto mb-6 text-slate-300" />
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">No orders found</h2>
                  <p className={`mb-8 text-lg ${secondaryTextClass}`}>
                    You haven't placed any orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}
                  </p>
                  <Button
                    onClick={() => navigate('/market')}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className={`rounded-xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5 ${expandedOrder === order.id ? 'shadow-xl' : 'shadow-md'} ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
                  >
                    {/* Order Summary */}
                    <div
                      onClick={() => toggleOrderExpansion(order.id)}
                      className={`p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-black">{order.orderNumber}</h3>
                            <div className={`flex items-center gap-1.5 ${secondaryTextClass} text-xs`}>
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{order.date}</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1.5 ${secondaryTextClass} text-xs sm:text-sm`}>
                            <Store className="w-3.5 h-3.5 text-amber-500" />
                            <span>{order.restaurant}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${order.status.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            order.status.toLowerCase() === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              order.status.toLowerCase() === 'on the way' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                order.status.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  order.status.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                            {statusIcons[order.status.toLowerCase()] || <Clock className="w-3.5 h-3.5" />}
                            <span>{order.status}</span>
                          </div>
                          <div className="text-right">
                            <p className={`${secondaryTextClass} text-xs`}>Total:</p>
                            <p className="text-lg font-bold text-black">{formatPrice(order.total)} ETB</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Preview Items */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex flex-wrap gap-2 items-center">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={`${order.id}-preview-${idx}`} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs shadow-sm">
                              {typeof item.image === 'string' && item.image.trim() !== '' && item.image.startsWith('http') ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-5 w-5 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">{item.image || '🛒'}</span>
                              )}
                              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                              <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-emerald-600 font-semibold text-xs">+{order.items.length - 2} more items</p>
                          )}
                        </div>
                        <div className="text-emerald-600 font-bold text-sm">
                          {expandedOrder === order.id ? '▲' : '▼'}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrder === order.id && (
                      <div className={`px-4 py-4 border-t animate-slideDown ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Order Items Detail */}
                          <div>
                            <h4 className="flex items-center gap-2 text-base font-bold text-black mb-4">
                              <Package className="w-4 h-4 text-emerald-600" /> Order Details
                            </h4>
                            <div className="space-y-3 mb-4">
                              {order.items.map((item, idx) => (
                                <div key={`${order.id}-full-${idx}`} className="flex justify-between items-center p-3 hover:bg-white rounded-lg transition-colors">
                                  <div className="flex items-center gap-3">
                                    {typeof item.image === 'string' && item.image.trim() !== '' && item.image.startsWith('http') ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <span className="text-3xl">{item.image || '🛒'}</span>
                                    )}
                                    <div>
                                      <h5 className="font-semibold text-black text-sm mb-0.5">{item.name}</h5>
                                      <p className="text-slate-600 text-xs">{item.price} ETB each</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-0.5">
                                      x{item.quantity}
                                    </div>
                                    <p className="font-bold text-black text-sm">{formatPrice(item.price * item.quantity)} ETB</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Breakdown */}
                            <div className={`rounded-lg p-4 space-y-2.5 ${mutedCardClass}`}>
                              <div className="flex justify-between text-slate-700 text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)} ETB</span>
                              </div>
                              <div className="flex justify-between text-slate-700 text-sm">
                                <span>Delivery Fee</span>
                                <span className={order.deliveryFee === 0 ? 'text-emerald-600 font-semibold' : ''}>
                                  {order.deliveryFee === 0 ? 'FREE' : `${formatPrice(order.deliveryFee)} ETB`}
                                </span>
                              </div>
                              <div className="flex justify-between text-slate-700 text-sm">
                                <span>Tax (15%)</span>
                                <span>{formatPrice(order.tax)} ETB</span>
                              </div>
                              <div className="flex justify-between border-t-2 border-slate-200 pt-2.5 text-black">
                                <span className="font-bold text-sm">Total</span>
                                <span className="text-xl font-black">{formatPrice(order.total)} ETB</span>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Information */}
                          <div>
                            <h4 className="flex items-center gap-2 text-base font-bold text-black mb-4">
                              <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Information
                            </h4>
                            <div className={`rounded-lg p-4 space-y-4 ${mutedCardClass}`}>
                              <div className="flex gap-3">
                                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-black text-sm mb-0.5">Address:</p>
                                  <p className="text-slate-600 text-xs leading-relaxed">{order.additionalInfo}</p>
                                  <p className="text-slate-600 text-xs">{order.address}, {order.city}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-black text-sm mb-0.5">Phone:</p>
                                  <p className="text-slate-600 text-xs">{order.phone}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-black text-sm mb-0.5">Email:</p>
                                  <p className="text-slate-600 text-xs">{order.email}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-black text-sm mb-0.5">Payment Method:</p>
                                  <p className="text-blue-600 font-semibold text-xs">
                                    {order.paymentMethod === 'cash' ? 'Cash on Delivery' :
                                      order.paymentMethod === 'card' ? 'Credit/Debit Card' :
                                        'Mobile Payment'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {order.specialInstructions && (
                              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <h5 className="font-bold text-amber-900 text-sm mb-1">Special Instructions</h5>
                                <p className="text-amber-800 text-xs">{order.specialInstructions}</p>
                              </div>
                            )}

                            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg flex gap-2.5">
                              <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-bold text-black text-sm mb-0.5">Estimated Delivery Time</h5>
                                <p className="text-slate-600 text-xs">{order.estimatedDelivery}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-col sm:flex-row pt-4 border-t border-slate-200">
                          <button
                            onClick={() => reorderItem(order)}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
                          >
                            <Tag className="w-3.5 h-3.5" /> Reorder
                          </button>
                          <button
                            onClick={() => viewReceipt(order)}
                            className="flex-1 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                          >
                            View Receipt
                          </button>
                          <button className={`flex-1 px-5 py-2.5 font-bold rounded-lg transition-colors text-sm ${theme === 'dark' ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            Get Help
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Clock, CheckCircle, Search, Loader2, AlertCircle,
  ShoppingBag, DollarSign, RefreshCw, ChevronDown,
  User, MapPin, Phone, Calendar, Eye, X, MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilterBar from './components/FilterBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmptyState from './components/EmptyState';
import api from '../../../api';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800 border border-amber-200',    dot: 'bg-amber-500' },
  processing: { label: 'Processing', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  'on the way': { label: 'On the way', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  completed:  { label: 'Completed',  color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800 border border-red-200',          dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-medium text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// Order detail modal
const OrderModal = ({ order, onClose, onStatusChange }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{order.orderNumber}</h3>
            <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4">
          {/* Status Update & Customer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Update Status</p>
              <Select value={order.status} onValueChange={(val) => onStatusChange(order.id, val)}>
                <SelectTrigger className="bg-white border-slate-200 h-9 w-full shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="on the way">On the way</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-200">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-emerald-600" />
                  </div>
                  {order.customer?.name || order.fullName}
                </div>
                {order.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-emerald-600" />
                    </div>
                    {order.phone}
                  </div>
                )}
                {(order.address || order.city) && (
                  <div className="flex gap-2 text-xs text-slate-600 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="leading-snug pt-0.5">{[order.address, order.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {order.items.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 bg-white ${i !== order.items.length - 1 ? 'border-b border-slate-200' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200">
                          <Package className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">{item.quantity} x {(item.price || 0).toFixed(2)} ETB</p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{(item.price * item.quantity).toFixed(2)} ETB</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financials & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {order.specialInstructions ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-amber-700/80 uppercase tracking-wider mb-1.5">Special Instructions</p>
                <p className="text-sm text-amber-900 font-medium">{order.specialInstructions}</p>
              </div>
            ) : (
              <div />
            )}
            
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Subtotal</span><span>{(order.subtotal || 0).toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Tax</span><span>{(order.tax || 0).toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Delivery</span><span>{(order.deliveryFee || 0).toFixed(2)} ETB</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-emerald-700 pt-2 border-t border-slate-200">
                <span>Total</span><span>{(order.total || 0).toFixed(2)} ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FarmerOrders = () => {
  const [filters, setFilters] = useState({ category: 'All', status: 'All', search: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/farmer/orders');
      // Normalise response
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.orders) ? res.data.orders : [];
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err?.response?.status === 404) {
        setOrders([]);
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updated = res.data;
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.error || 'Failed to update order status. Please try again.');
    }
  };

  // Debounced search handler
  const handleSearchChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.name || order.fullName || '';
    const matchSearch =
      customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      (order.orderNumber || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'All' || order.status === filters.status;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;

  // Export configuration
  const exportColumns = [
    { key: 'orderNumber', header: 'Order ID' },
    { key: 'customerName', header: 'Customer' },
    { key: 'total', header: 'Total (ETB)' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Order Date' },
  ];

  const getExportData = () => {
    return filteredOrders.map(order => ({
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || order.fullName || 'N/A',
      total: order.total || 0,
      status: order.status,
      createdAt: new Date(order.createdAt).toLocaleString(),
    }));
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900">Orders Management</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Track, process, and fulfill your customer orders efficiently.</p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="gap-2 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Data</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard icon={ShoppingBag}    label="Total Orders"  value={orders.length}           color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Clock}          label="Pending"       value={pendingCount}             color="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle}    label="Completed"     value={completedCount}           color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={DollarSign}     label="Revenue (ETB)" value={totalRevenue.toFixed(0)} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          statuses={['pending', 'processing', 'on the way', 'delivered', 'completed', 'cancelled']} 
          exportData={getExportData()}
          exportColumns={exportColumns}
          exportFilename="orders"
          exportTitle="Orders Report"
        />
        <div className="flex-1 focus-visible:outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500 mb-3" />
                <p className="text-slate-500 text-sm">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6 min-h-[300px]">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3 shadow-inner">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Unable to load orders</h3>
                <p className="text-slate-500 text-xs mt-1 mb-4 max-w-sm">{error}</p>
                <Button onClick={fetchOrders} className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-6 shadow-sm h-9 text-sm">Try Again</Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders found"
                description={filters.search || filters.status !== 'All' ? 'Try adjusting your search terms.' : 'Orders from customers will appear here.'}
                actionLabel="Clear Filters"
                onAction={() => setFilters({ search: '', status: 'All' })}
                secondaryActionLabel="Refresh"
                onSecondaryAction={fetchOrders}
              />
            ) : (
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5">Order ID</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5">Customer</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">Date</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5">Total</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5">Status</th>
                      <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                          <span className="font-mono font-semibold text-slate-700 text-[10px] sm:text-xs">{order.orderNumber}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm text-white text-[9px] sm:text-[10px] font-black">
                              {(order.customer?.name || order.fullName || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900 text-[10px] sm:text-xs leading-tight truncate max-w-[100px] sm:max-w-none">{order.customer?.name || order.fullName}</span>
                              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                                <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {order.items?.length || 0} items
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5 hidden sm:table-cell">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                          <div className="font-semibold text-slate-900 text-[10px] sm:text-xs">
                            {(order.total || 0).toFixed(2)} <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400">ETB</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                          <Select value={order.status} onValueChange={val => updateOrderStatus(order.id, val)}>
                            <SelectTrigger className="h-6 sm:h-7 w-24 sm:w-32 border-0 shadow-none p-0 focus:ring-0 bg-transparent hover:bg-slate-50 rounded-md pl-1 transition-colors">
                              <StatusBadge status={order.status} />
                              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </SelectTrigger>
                            <SelectContent className="z-[100] font-medium">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="on the way">On the way</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Footer summary */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs font-medium text-slate-500">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
            <span>Filtered Total: <span className="font-semibold text-slate-900 ml-1">{filteredOrders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)} ETB</span></span>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default FarmerOrders;

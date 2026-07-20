import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Filter,
  MapPin,
  Package,
  ReceiptText,
  RefreshCw,
  Store,
  Truck
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ReviewModal from '../../components/reviews/ReviewModal';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const statusMeta = useMemo(() => ({
    pending: { label: 'Pending', badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300' },
    processing: { label: 'Processing', badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300' },
    delivered: { label: 'Delivered', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300' },
    cancelled: { label: 'Cancelled', badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300' },
    'on the way': { label: 'On the way', badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300' }
  }), []);

  useEffect(() => {
    fetchOrders();
    fetchMyReviews();
  }, []);

  useEffect(() => {
    if (location.state?.latestOrder) {
      setOrders((prev) => {
        const exists = prev.some((entry) => String(entry.id) === String(location.state.latestOrder.id));
        return exists ? prev : [location.state.latestOrder, ...prev];
      });
    }
  }, [location.state?.latestOrder]);

  const fetchMyReviews = async () => {
    try {
      const response = await api.get('/reviews/me');
      setMyReviews(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.warn('Unable to load your reviews', error);
      setMyReviews([]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const serverOrders = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');

      const normalizeOrder = (order) => {
        const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
        const parsedItems = Array.isArray(order.items)
          ? order.items
          : typeof order.items === 'string'
            ? JSON.parse(order.items || '[]')
            : [];

        return {
          ...order,
          orderNumber: order.orderCode || `ORD-${String(order.id).padStart(5, '0')}`,
          date: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          timestamp: orderDate.toISOString(),
          status: (order.status || 'processing').toLowerCase(),
          paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'unpaid' : 'paid'),
          items: parsedItems,
          vendor: order.vendor || order.restaurant || 'FarmConnect',
          fullName: order.fullName || order.customer?.name || user?.name || 'Customer'
        };
      };

      const normalizedServerOrders = serverOrders.map(normalizeOrder);
      const normalizedSavedOrders = savedOrders.map(normalizeOrder);
      const mergedOrders = [...normalizedSavedOrders, ...normalizedServerOrders.filter((serverOrder) => !normalizedSavedOrders.some((savedOrder) => String(savedOrder.id) === String(serverOrder.id)))];
      const filteredByCustomer = mergedOrders.filter((order) => {
        const matchesCustomerId = user?.id && order.customerId ? Number(order.customerId) === Number(user.id) : false;
        const matchesEmail = user?.email && order.email ? String(order.email).toLowerCase() === String(user.email).toLowerCase() : false;
        const matchesName = user?.name && order.fullName ? String(order.fullName).toLowerCase() === String(user.name).toLowerCase() : false;
        return matchesCustomerId || matchesEmail || matchesName || (!order.customerId && !order.email && !order.fullName);
      });

      const finalOrders = filteredByCustomer.sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
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

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (filter === 'all'
      ? orders
      : orders.filter((order) => order.status.toLowerCase() === filter.toLowerCase())
    ).filter((order) => {
      if (!normalizedSearch) return true;
      const haystack = `${order.orderNumber} ${order.vendor} ${order.fullName} ${order.status}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [orders, filter, search]);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder((current) => (current === orderId ? null : orderId));
  };

  const formatPrice = (value) => Number(value || 0).toFixed(2);

  const viewReceipt = (order) => {
    navigate(`/customer/orders/receipt/${order.id || order.orderNumber}`, { state: { order } });
  };

  const openReviewModal = (order, item) => {
    const productId = item.productId || item.id || item._id || item.product?.id;
    const existingReview = myReviews.find((review) => Number(review.productId) === Number(productId) && Number(review.orderId) === Number(order.id));

    setSelectedReviewItem({ ...item, name: item.name || 'Product', productId });
    setSelectedReviewOrder(order);
    setCurrentReview(existingReview || null);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReviewItem(null);
    setSelectedReviewOrder(null);
    setCurrentReview(null);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!selectedReviewItem || !selectedReviewOrder) {
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        productId: selectedReviewItem.productId,
        orderId: selectedReviewOrder.id,
        rating,
        comment
      });
      toast.success(currentReview ? 'Review updated successfully' : 'Review submitted successfully');
      closeReviewModal();
      fetchMyReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save your review right now.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Header pageType="orders" />

      <div className="px-3 py-3 sm:px-4 lg:px-6">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-2.5 sm:gap-3">
        <section className="grid gap-2 sm:grid-cols-3">
          <Card className="border-none ring-0 bg-[var(--card)] shadow-sm">
            <CardContent className="p-2.5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-emerald-600">Visible Orders</p>
              <p className="mt-1 text-lg font-semibold">{filteredOrders.length}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">Matching your current view</p>
            </CardContent>
          </Card>
          <Card className="border-none ring-0 bg-[var(--card)] shadow-sm">
            <CardContent className="p-2.5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-emerald-600">Total Spent</p>
              <p className="mt-1 text-lg font-semibold">{formatPrice(orders.reduce((sum, order) => sum + Number(order.total || 0), 0))} ETB</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">Across your saved orders</p>
            </CardContent>
          </Card>
          <Card className="border-none ring-0 bg-[var(--card)] shadow-sm">
            <CardContent className="p-2.5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-emerald-600">Average Order</p>
              <p className="mt-1 text-lg font-semibold">{orders.length ? formatPrice(orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length) : '0.00'} ETB</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">Average order value</p>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-2 rounded-xl border-none bg-[var(--card)] p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-2.5">
          <div className="flex flex-1 items-center gap-2 rounded-lg border-none bg-[var(--secondary)] px-2.5 py-2">
            <Filter className="h-3.5 w-3.5 text-emerald-600" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 w-full border-0 bg-transparent p-0 shadow-none focus:ring-0 sm:w-[170px]">
                <SelectValue placeholder="Filter orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders ({orders.length})</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="on the way">On the Way</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg border-none bg-[var(--secondary)] px-2.5 py-2">
            <Package className="h-3.5 w-3.5 text-emerald-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-none bg-[var(--card)] p-6 text-center shadow-sm">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm font-medium">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border-none bg-[var(--card)] p-6 text-center shadow-sm">
            <Package className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-2 text-base font-semibold">No orders found</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">We could not find any orders that match your current view.</p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            {filteredOrders.map((order) => {
              const orderStatus = order.status || 'processing';
              const meta = statusMeta[orderStatus] || statusMeta.processing;
              const previewItems = order.items.slice(0, 2);
              return (
                <Card key={order.id} className="overflow-hidden border-none ring-0 bg-[var(--card)] shadow-sm">
                  <CardContent className="p-2 sm:p-2.5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold">{order.orderNumber}</p>
                            <Badge className={`rounded-full border px-1.5 py-0.25 text-[9px] font-medium ${meta.badge}`}>
                              {meta.label}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-[var(--muted-foreground)]">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-2.5 w-2.5 text-emerald-600" />
                              {order.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Store className="h-2.5 w-2.5 text-amber-600" />
                              {order.vendor}
                            </span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Total</p>
                          <p className="text-[13px] font-semibold">{formatPrice(order.total)} ETB</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {previewItems.map((item, index) => (
                          <div key={`${order.id}-${index}`} className="inline-flex items-center gap-1 rounded-full border-none bg-[var(--secondary)] px-1.5 py-0.5 text-[9px]">
                            <span className="text-[9px]">🛒</span>
                            <span className="max-w-[84px] truncate">{item.name || 'Product'}</span>
                            <span className="text-[var(--muted-foreground)]">x{item.quantity || 1}</span>
                          </div>
                        ))}
                        {order.items.length > previewItems.length && (
                          <div className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            +{order.items.length - previewItems.length} more
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-[9px] text-[var(--muted-foreground)]">
                          <span>{order.items.length} item(s)</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-2.5 w-2.5" />
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-6 rounded-md border-none bg-[var(--secondary)] px-2 text-[9px]" onClick={() => viewReceipt(order)}>
                            <ReceiptText className="mr-1 h-2.5 w-2.5" />
                            Receipt
                          </Button>
                          <Button size="sm" className="h-6 rounded-md bg-emerald-600 px-2 text-[9px] hover:bg-emerald-700" onClick={() => toggleOrderExpansion(order.id)}>
                            {expandedOrder === order.id ? 'Hide' : 'Details'}
                            <ChevronRight className="ml-1 h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>

                      {expandedOrder === order.id && (
                        <div className="rounded-xl border-none bg-[var(--secondary)]/70 p-2.5 text-xs">
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Delivery</p>
                                  <p className="text-xs">{order.address || 'Delivery address available on your receipt'}</p>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">{order.city || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Truck className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Payment</p>
                                  <p className="text-xs capitalize">{order.paymentMethod || 'cash'}</p>
                                  <p className="text-[11px] text-[var(--muted-foreground)]">{order.paymentStatus || 'Pending'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="rounded-lg border-none bg-[var(--card)] p-2.5 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                                  <span>{formatPrice(order.subtotal || order.total || 0)} ETB</span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="text-[var(--muted-foreground)]">Delivery</span>
                                  <span>{formatPrice(order.deliveryFee || 0)} ETB</span>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                  <span className="text-[var(--muted-foreground)]">Tax</span>
                                  <span>{formatPrice(order.tax || 0)} ETB</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-1.5 font-semibold">
                                  <span>Total</span>
                                  <span>{formatPrice(order.total || 0)} ETB</span>
                                </div>
                              </div>

                              <div className="rounded-lg border-none bg-[var(--card)] p-2.5 text-[11px]">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="font-semibold">Review your purchases</span>
                                  <span className="text-[var(--muted-foreground)]">{order.status === 'delivered' ? 'Eligible' : 'Pending delivery'}</span>
                                </div>
                                <div className="space-y-2">
                                  {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((item, index) => {
                                    const productId = item.productId || item.id || item._id || item.product?.id;
                                    const existingReview = myReviews.find((review) => Number(review.productId) === Number(productId) && Number(review.orderId) === Number(order.id));
                                    return (
                                      <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border-none bg-[var(--secondary)] px-2 py-2">
                                        <span className="max-w-[180px] truncate text-xs font-medium">{item.name || 'Product'}</span>
                                        {order.status === 'delivered' ? (
                                          <Button size="sm" variant="outline" className="h-7 rounded-md border-none bg-[var(--card)] px-2 text-[10px]" onClick={() => openReviewModal(order, item)}>
                                            {existingReview ? 'Edit Review' : 'Write Review'}
                                          </Button>
                                        ) : (
                                          <span className="text-[10px] text-[var(--muted-foreground)]">Awaiting delivery</span>
                                        )}
                                      </div>
                                    );
                                  }) : (
                                    <p className="text-[10px] text-[var(--muted-foreground)]">No purchased items to review.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <ReviewModal
        open={reviewModalOpen}
        onClose={closeReviewModal}
        item={selectedReviewItem}
        initialReview={currentReview}
        onSubmit={handleReviewSubmit}
        loading={reviewSubmitting}
        theme={theme}
      />
      <Footer />
      </div>
    </div>
  );
};

export default Orders;
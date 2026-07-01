import React, { useState, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const RecentOrders = memo(({ orders = [], onViewAll }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.customer?.name || order.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortField === 'amount') {
      comparison = (b.total || 0) - (a.total || 0);
    } else if (sortField === 'customer') {
      comparison = (a.customer?.name || a.fullName || '').localeCompare(b.customer?.name || b.fullName || '');
    }
    return sortDirection === 'desc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'pending':
      case 'processing':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  const recentOrders = paginatedOrders.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
          <p className="text-xs text-muted-foreground">Latest customer orders</p>
        </div>
        <button 
          onClick={onViewAll}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          View All
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
            aria-label="Search orders by customer name or order number"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-24 h-8 text-xs" aria-label="Filter by order status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 text-center">
          <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
          <p className="text-xs text-red-600">Error loading orders</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-t-lg border-b border-slate-200" role="row">
            <button
              onClick={() => handleSort('customer')}
              className="text-[10px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-1"
              aria-label={`Sort by customer. Currently ${sortField === 'customer' ? `sorted ${sortDirection}` : 'unsorted'}`}
            >
              Customer
              {sortField === 'customer' && <ArrowUpDown className="h-3 w-3" aria-hidden="true" />}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className="text-[10px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-1"
              aria-label={`Sort by amount. Currently ${sortField === 'amount' ? `sorted ${sortDirection}` : 'unsorted'}`}
            >
              Amount
              {sortField === 'amount' && <ArrowUpDown className="h-3 w-3" aria-hidden="true" />}
            </button>
            <button
              onClick={() => handleSort('date')}
              className="text-[10px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-1"
              aria-label={`Sort by status. Currently ${sortField === 'date' ? `sorted ${sortDirection}` : 'unsorted'}`}
            >
              Status
              {sortField === 'date' && <ArrowUpDown className="h-3 w-3" aria-hidden="true" />}
            </button>
          </div>

          {/* Orders List */}
          <div className="flex-1 space-y-1">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-900 mb-0.5">No recent orders</p>
                <p className="text-[10px] text-muted-foreground mb-2">Orders from customers will appear here</p>
                <button
                  onClick={onViewAll}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  View Orders
                </button>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-base overflow-hidden">
                    {order.items?.[0]?.image ? (
                      <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {order.customer?.name || order.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{(order.total || 0).toFixed(2)} ETB</p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <p className="text-[10px] text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default RecentOrders;

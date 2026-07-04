import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../../api';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingUp, Star, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import StatCard from '../components/StatCard';
import EarningsChart from '../components/EarningsChart';
import TopSellingProducts from '../components/TopSellingProducts';
import RecentOrders from '../components/RecentOrders';
import FarmTipsAlerts from '../components/FarmTipsAlerts';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Removed getFarmOrders localStorage usage

const FarmerHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    lowStockProducts: 0,
    inventoryAlerts: 0,
    pendingReviews: 0,
    monthlyRevenue: 0,
    rating: 4.7,
    ratingCount: 128,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('=== Fetching Farmer Dashboard Data ===');
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        api.get('/farmer/products'),
        api.get('/farmer/orders'),
        api.get('/farmer/stats')
      ]);

      const productsData = productsRes.data || [];
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      const statsData = statsRes.data || {};

      console.log('Products:', productsData.length);
      console.log('Orders:', ordersData.length);
      console.log('Orders data:', ordersData);
      console.log('Stats:', statsData);

      setProductCount(productsData.length);
      setOrders(ordersData);

      // Use stats from API, fallback to calculated values
      const totalRevenue = statsData.totalEarnings || ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = statsData.pendingOrders || ordersData.filter(o => o.status === 'pending' || o.status === 'processing').length;
      const completedOrders = statsData.completedOrders || ordersData.filter(o => o.status === 'delivered' || o.status === 'completed').length;
      const cancelledOrders = statsData.cancelledOrders || ordersData.filter(o => o.status === 'cancelled' || o.status === 'rejected').length;
      const lowStockProducts = statsData.lowStockProducts || productsData.filter(p => p.stock < 10).length;
      const inventoryAlerts = statsData.inventoryAlerts || productsData.filter(p => p.stock === 0).length;
      const pendingReviews = 5; // Mock data - would come from API

      setStats(prev => ({
        ...prev,
        totalProducts: statsData.totalProducts || productsData.length,
        totalOrders: statsData.totalOrders || ordersData.length,
        totalEarnings: totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        lowStockProducts,
        inventoryAlerts,
        pendingReviews,
        monthlyRevenue: statsData.monthlyRevenue || 0,
      }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Could not load dashboard data.');
      // Set empty orders array on error to prevent undefined errors
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      const updatedOrder = res.data;
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      
      // Update stats if needed
      setStats(prev => {
        const totalRevenue = prev.totalRevenue; // recalculate if necessary
        const pendingOrders = orders.map(o => o.id === orderId ? updatedOrder : o).filter(o => o.status === 'pending' || o.status === 'processing').length;
        const completedOrders = orders.map(o => o.id === orderId ? updatedOrder : o).filter(o => o.status === 'delivered' || o.status === 'completed').length;
        return { ...prev, pendingOrders, completedOrders };
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleCloseOrders = () => {
    setShowOrders(false);
    // Remove query param from URL without refreshing
    navigate('/farmer/dashboard', { replace: true });
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full px-2 sm:px-4 py-4 sm:py-6 animate-in fade-in duration-500">
      {loading ? (
        <>
          {/* Primary KPI Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>

          {/* Secondary KPI Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 w-full">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <LoadingSkeleton variant="card" className="h-24 sm:h-32 w-full" />

          {/* Chart and Products Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 w-full">
            <div className="lg:col-span-7 h-full min-h-[300px] sm:min-h-[350px]">
              <LoadingSkeleton variant="chart" />
            </div>
            <div className="lg:col-span-5 h-full min-h-[300px] sm:min-h-[350px]">
              <LoadingSkeleton variant="list" />
            </div>
          </div>

          {/* Orders and Tips Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
            <LoadingSkeleton variant="table" />
            <LoadingSkeleton variant="list" />
          </div>
</>
      ) : (
        <>
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              color="green"
              trend="+18% this week"
              trendDirection="up"
              comparison="vs last week"
              sparklineData={[10, 12, 15, 14, 18, 20, 22]}
              loading={loading}
            />
            <StatCard
              title="Total Earnings"
              value={`${stats.totalEarnings?.toLocaleString() || 0} ETB`}
              icon={DollarSign}
              color="mint"
              trend="+22% this week"
              trendDirection="up"
              comparison="vs last week"
              sparklineData={[5000, 6000, 5500, 7000, 7500, 8000, 8500]}
              loading={loading}
            />
            <StatCard
              title="Products Listed"
              value={stats.totalProducts}
              icon={Package}
              color="orange"
              trend="+4 new this week"
              trendDirection="up"
              comparison="vs last week"
              loading={loading}
            />
            <StatCard
              title="Average Rating"
              value={stats.rating}
              icon={Star}
              color="blue"
              rating={stats.rating}
              ratingCount={stats.ratingCount}
              loading={loading}
            />
          </div>

          {/* Secondary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 w-full">
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={Clock}
              color="orange"
              trend="Requires attention"
              trendDirection="neutral"
              loading={loading}
            />
            <StatCard
              title="Completed Orders"
              value={stats.completedOrders}
              icon={CheckCircle}
              color="green"
              trend="+12% this week"
              trendDirection="up"
              loading={loading}
            />
            <StatCard
              title="Cancelled Orders"
              value={stats.cancelledOrders}
              icon={XCircle}
              color="red"
              trend="-3% this week"
              trendDirection="down"
              loading={loading}
            />
            <StatCard
              title="Low Stock"
              value={stats.lowStockProducts}
              icon={AlertTriangle}
              color="orange"
              trend="Needs restock"
              trendDirection="neutral"
              loading={loading}
            />
            <StatCard
              title="Inventory Alerts"
              value={stats.inventoryAlerts}
              icon={AlertTriangle}
              color="red"
              trend="Out of stock"
              trendDirection="down"
              loading={loading}
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews}
              icon={MessageSquare}
              color="blue"
              trend="Awaiting response"
              trendDirection="neutral"
              loading={loading}
            />
          </div>

          {/* First Row - Earnings Chart (7 cols) and Top Selling Products (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 w-full">
            <div className="lg:col-span-7 h-full min-h-[300px] sm:min-h-[350px]">
              <EarningsChart />
            </div>
            <div className="lg:col-span-5 h-full min-h-[300px] sm:min-h-[350px]">
              <TopSellingProducts />
            </div>
          </div>



<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 w-full">
  <div className="min-h-[300px] bg-white border border-slate-200 rounded-xl shadow-sm">
    <RecentOrders orders={orders.slice(0, 5)} onViewAll={() => navigate('/farmer/orders')} />
  </div>
  <div className="min-h-[300px] bg-white border border-slate-200 rounded-xl shadow-sm">
    <FarmTipsAlerts />
  </div>
</div>
</>
      )}

      {/* Debug info */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
          <p className="text-sm mt-1">Orders count: {orders.length}</p>
        </div>
      )}
    </div>
  );
};

export default FarmerHome;

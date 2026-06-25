import React, { useEffect, useState } from 'react';
import api from '../../../../api';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingUp, Star, DollarSign } from 'lucide-react';
import StatCard from '../components/StatCard';
import EarningsChart from '../components/EarningsChart';
import TopSellingProducts from '../components/TopSellingProducts';
import FarmTipsAlerts from '../components/FarmTipsAlerts';
import RecentOrders from '../components/RecentOrders';

const getFarmOrders = () => {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  return allOrders;
};

const FarmerHome = () => {
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    rating: 4.7,
    ratingCount: 128,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/farmer/products');
      setProductCount(res.data?.length || 0);
      setStats(prev => ({ ...prev, totalProducts: res.data?.length || 0 }));
    } catch (err) {
      setError('Could not load product information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const allOrders = getFarmOrders();
    const totalRevenue = allOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
    );
    const pendingOrders = allOrders.filter(order => 
      order.status === 'pending' || order.status === 'processing'
    ).length;
    const completedOrders = allOrders.filter(order => 
      order.status === 'delivered'
    ).length;
    
    setStats(prev => ({
      ...prev,
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
    }));
  }, []);

  const handleShowOrders = () => {
    setOrders(getFarmOrders());
    setShowOrders(true);
  };

  const handleStatusChange = (orderIdx, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[orderIdx] = { ...updatedOrders[orderIdx], status: newStatus };
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleCloseOrders = () => setShowOrders(false);

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="green"
          trend="+18% this week"
        />
        <StatCard
          title="Total Earnings"
          value={`${stats.totalRevenue.toLocaleString()} ETB`}
          icon={DollarSign}
          color="mint"
          trend="+22% this week"
        />
        <StatCard
          title="Products Listed"
          value={stats.totalProducts}
          icon={Package}
          color="orange"
          trend="+4 new this week"
        />
        <StatCard
          title="Average Rating"
          value={stats.rating}
          icon={Star}
          color="blue"
          rating={stats.rating}
          ratingCount={stats.ratingCount}
        />
      </div>

      {/* Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (60%) */}
        <div className="lg:col-span-2 space-y-6">
          <EarningsChart />
          <TopSellingProducts />
          <FarmTipsAlerts />
        </div>

        {/* Right Column (40%) */}
        <div className="space-y-6">
          <RecentOrders />
        </div>
      </div>

      {/* Orders Modal */}
      {showOrders && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-4xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-forest-900">Farm Orders</h3>
            <button 
              onClick={handleCloseOrders}
              className="bg-none border-none text-2xl cursor-pointer text-forest-400 hover:text-forest-600 transition-colors"
            >
              ×
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center text-forest-400 text-lg my-8">No orders found.</div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, idx) => (
                <div key={idx} className="bg-white border border-forest-100 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-forest-900">Order #{order.orderId || idx+1}</span>
                    <span className="text-forest-600 text-sm">{order.orderDate?.slice(0,10)}</span>
                  </div>
                  <div className="mb-2"><b>Customer:</b> {order.fullName} <span className="text-forest-400">({order.phone})</span></div>
                  <div className="mb-2"><b>Address:</b> {order.city}, {order.address} {order.additionalInfo && (<span>, {order.additionalInfo}</span>)}</div>
                  <div className="mb-2"><b>Payment:</b> <span className="text-mint-600">{order.paymentMethod}</span></div>
                  <div className="mb-2 flex items-center gap-3">
                    <b>Status:</b>
                    <select 
                      value={order.status || 'processing'} 
                      onChange={e => handleStatusChange(idx, e.target.value)}
                      className="px-2.5 py-1 rounded-md border border-forest-200 bg-forest-50 text-forest-800 font-semibold text-sm"
                    >
                      <option value="processing">Processing</option>
                      <option value="on the way">On the Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="mb-2"><b>Products:</b></div>
                  <table className="w-full border-collapse mb-2">
                    <thead>
                      <tr className="bg-forest-50">
                        <th className="text-left px-2 py-1.5 font-semibold text-forest-900 text-base">Product</th>
                        <th className="text-center px-2 py-1.5 font-semibold text-forest-900 text-base">Qty</th>
                        <th className="text-center px-2 py-1.5 font-semibold text-forest-900 text-base">Price</th>
                        <th className="text-center px-2 py-1.5 font-semibold text-forest-900 text-base">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="border-b border-forest-100">
                          <td className="px-2 py-1.5">{item.name}</td>
                          <td className="text-center px-2 py-1.5">{item.quantity}</td>
                          <td className="text-center px-2 py-1.5">{item.price} ETB</td>
                          <td className="text-center px-2 py-1.5">{(item.price * item.quantity).toFixed(2)} ETB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right font-bold text-forest-900 text-lg">Order Total: {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} ETB</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FarmerHome;

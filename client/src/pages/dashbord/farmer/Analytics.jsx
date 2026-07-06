import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../../api';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [trafficData, setTrafficData] = useState({ dailyViews: [], totalViews: 0, uniqueVisitors: 0 });
  const [performanceData, setPerformanceData] = useState({ avgRating: 0, totalReviews: 0 });
  const [totalSales, setTotalSales] = useState(0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesRes, trafficRes, perfRes, productsRes] = await Promise.all([
        api.get('/farmer/analytics/sales'),
        api.get('/farmer/analytics/traffic'),
        api.get('/farmer/analytics/performance'),
        api.get('/farmer/products')
      ]);

      const products = productsRes.data;
      const sales = salesRes.data;
      setTotalSales(sales.totalSales || 0);
      
      // Map product IDs to names for the chart
      const formattedSales = Object.keys(sales.salesByProduct).map(productId => {
        const product = products.find(p => p.id === productId);
        const data = sales.salesByProduct[productId];
        return {
          name: product ? product.name : 'Unknown Product',
          revenue: data.revenue,
          quantity: data.quantity
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 5); // Top 5 products

      setSalesData(formattedSales);

      const traffic = trafficRes.data;
      setTrafficData({
        ...traffic,
        dailyViewsData: (traffic.dailyViews || []).map((views, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] || `Day ${i+1}`,
          views
        }))
      });

      setPerformanceData(perfRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-slate-500">Loading your store analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Deep insights into your store's performance.</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={ShoppingBag} 
          label="Total Sales" 
          value={`ETB ${totalSales.toLocaleString()}`} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          icon={Users} 
          label="Unique Visitors" 
          value={trafficData.uniqueVisitors} 
          sub="Last 30 days"
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Page Views" 
          value={trafficData.totalViews} 
          sub="Last 7 days"
          color="bg-purple-50 text-purple-600" 
        />
        <StatCard 
          icon={BarChart3} 
          label="Avg Rating" 
          value={`${performanceData.avgRating} / 5`} 
          sub={`From ${performanceData.totalReviews} reviews`}
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top Performing Products (Revenue)</h2>
          {salesData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} width={100} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              Not enough sales data.
            </div>
          )}
        </div>

        {/* Store Traffic Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Store Traffic (Last 7 Days)</h2>
          {trafficData.dailyViewsData?.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData.dailyViewsData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`${value} Views`, 'Traffic']}
                  />
                  <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No traffic data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

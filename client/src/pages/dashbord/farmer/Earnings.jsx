import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const Earnings = () => {
  const [earnings, setEarnings] = useState({ totalEarnings: 0, monthlyRevenue: 0, availableForWithdrawal: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/farmer/earnings'),
        api.get('/farmer/earnings/reports')
      ]);
      setEarnings(statsRes.data);
      
      const reports = reportsRes.data;
      const formattedData = Object.keys(reports).map(key => {
        const [year, month] = key.split('-');
        const date = new Date(year, month - 1);
        return {
          name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: reports[key]
        };
      }).sort((a, b) => new Date(a.name) - new Date(b.name));
      
      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleWithdrawal = async () => {
    try {
      await api.post('/farmer/earnings/withdraw', { amount: earnings.availableForWithdrawal });
      alert('Withdrawal request submitted successfully!');
      fetchEarnings();
    } catch (error) {
      alert('Failed to request withdrawal. ' + (error.response?.data?.message || ''));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-slate-500">Loading your earnings data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Earnings</h1>
          <p className="text-sm text-slate-500 mt-1">Track your revenue and manage withdrawals.</p>
        </div>
        <Button onClick={fetchEarnings} variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Total Earnings" 
          value={`ETB ${earnings.totalEarnings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          icon={DollarSign} 
          label="Monthly Revenue" 
          value={`ETB ${earnings.monthlyRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={Wallet} 
          label="Available for Withdrawal" 
          value={`ETB ${earnings.availableForWithdrawal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Revenue Overview</h2>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `ETB ${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`ETB ${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No revenue data available yet.
            </div>
          )}
        </div>

        {/* Withdrawal Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Withdraw Funds</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              You currently have <strong className="text-slate-900">ETB {earnings.availableForWithdrawal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> available to transfer to your linked bank account.
            </p>
          </div>
          
          <Button 
            onClick={handleWithdrawal} 
            disabled={earnings.availableForWithdrawal <= 0}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-sm font-medium rounded-lg group"
          >
            Request Withdrawal
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Earnings;

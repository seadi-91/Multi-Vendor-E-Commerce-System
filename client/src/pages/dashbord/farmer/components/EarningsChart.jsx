import React, { useState, memo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Download, Calendar, BarChart2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import api from '../../../../api';

const EarningsChart = memo(() => {
  const [timeframe, setTimeframe] = useState('week');
  const [showComparison, setShowComparison] = useState(false);
  const [showAverage, setShowAverage] = useState(true);
  const [showProjected, setShowProjected] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/farmer/earnings/chart?timeframe=${timeframe}`);
        setData(res.data || []);
      } catch (err) {
        console.error('Failed to fetch earnings chart data:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [timeframe]);

  const currentData = data;
  const totalEarnings = currentData.reduce((sum, item) => sum + (item.earnings || 0), 0);
  const totalPrevious = currentData.reduce((sum, item) => sum + (item.previous || 0), 0);
  const totalProjected = currentData.reduce((sum, item) => sum + (item.projected || 0), 0);
  const averageEarnings = currentData.length > 0 ? totalEarnings / currentData.length : 0;
  const percentageChange = totalPrevious > 0 ? ((totalEarnings - totalPrevious) / totalPrevious * 100).toFixed(1) : '0.0';
  const isPositive = parseFloat(percentageChange) >= 0;

  const handleDownloadReport = () => {
    console.log('Downloading report for', timeframe);
    // Implement download functionality
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Earnings Overview</h3>
            <p className="text-xs text-muted-foreground">Track your farm's revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 h-8 text-sm rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (currentData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Earnings Overview</h3>
            <p className="text-xs text-muted-foreground">Track your farm's revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32 h-8 text-sm rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No earnings data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Earnings Overview</h3>
          <p className="text-xs text-muted-foreground">Track your farm's revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32 h-8 text-sm rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownloadReport} aria-label="Download report">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch id="comparison" checked={showComparison} onCheckedChange={setShowComparison} />
          <label htmlFor="comparison" className="text-xs text-slate-600 cursor-pointer">Compare</label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="average" checked={showAverage} onCheckedChange={setShowAverage} />
          <label htmlFor="average" className="text-xs text-slate-600 cursor-pointer">Average</label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="projected" checked={showProjected} onCheckedChange={setShowProjected} />
          <label htmlFor="projected" className="text-xs text-slate-600 cursor-pointer">Projected</label>
        </div>
      </div>

      <div className="flex-1 min-h-0 mb-3" style={{ minHeight: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C5A30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0C5A30" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#68807F" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#68807F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE9" />
            <XAxis 
              dataKey="name" 
              stroke="#68807F"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#68807F"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8EFE9',
                borderRadius: '8px',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === 'earnings') return [`${value.toLocaleString()} ETB`, 'Current'];
                if (name === 'previous') return [`${value.toLocaleString()} ETB`, 'Previous'];
                if (name === 'projected') return [`${value.toLocaleString()} ETB`, 'Projected'];
                return [value, name];
              }}
            />
            {showAverage && (
              <ReferenceLine 
                y={averageEarnings} 
                stroke="#68807F" 
                strokeDasharray="3 3" 
                label={{ value: 'Avg', position: 'right', fontSize: 10, fill: '#68807F' }}
              />
            )}
            {showComparison && (
              <Area 
                type="monotone" 
                dataKey="previous" 
                stroke="#68807F" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0.5}
                fill="url(#colorPrevious)"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            )}
            {showProjected && (
              <Area 
                type="monotone" 
                dataKey="projected" 
                stroke="#F59E0B" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={0.3}
                fill="url(#colorProjected)"
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            )}
            <Area 
              type="monotone" 
              dataKey="earnings" 
              stroke="#0C5A30" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEarnings)"
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
            {(showComparison || showProjected) && (
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="line"
                wrapperStyle={{ fontSize: 11 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-500">Current Earnings</p>
            <p className="text-sm font-semibold text-slate-900">{totalEarnings.toLocaleString()} ETB</p>
          </div>
          {showComparison && (
            <div>
              <p className="text-xs text-slate-500">Previous Period</p>
              <p className="text-sm font-semibold text-slate-600">{totalPrevious.toLocaleString()} ETB</p>
            </div>
          )}
          {showProjected && (
            <div>
              <p className="text-xs text-slate-500">Projected</p>
              <p className="text-sm font-semibold text-amber-600">{totalProjected.toLocaleString()} ETB</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">vs Previous</p>
          <Badge variant={isPositive ? 'default' : 'destructive'} className={`flex items-center gap-1 ${isPositive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{percentageChange}%
          </Badge>
        </div>
      </div>
    </div>
  );
});

export default EarningsChart;

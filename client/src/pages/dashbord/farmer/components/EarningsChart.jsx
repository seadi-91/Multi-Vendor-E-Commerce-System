import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EarningsChart = () => {
  const [timeframe, setTimeframe] = useState('week');

  const data = {
    week: [
      { name: 'Mon', earnings: 4500 },
      { name: 'Tue', earnings: 5200 },
      { name: 'Wed', earnings: 4800 },
      { name: 'Thu', earnings: 6100 },
      { name: 'Fri', earnings: 5800 },
      { name: 'Sat', earnings: 7200 },
      { name: 'Sun', earnings: 6900 },
    ],
    month: [
      { name: 'Week 1', earnings: 28000 },
      { name: 'Week 2', earnings: 32000 },
      { name: 'Week 3', earnings: 29000 },
      { name: 'Week 4', earnings: 35000 },
    ],
  };

  const currentData = data[timeframe];
  const totalEarnings = currentData.reduce((sum, item) => sum + item.earnings, 0);
  const previousEarnings = timeframe === 'week' ? 38000 : 112000;
  const percentageChange = ((totalEarnings - previousEarnings) / previousEarnings * 100).toFixed(1);
  const isPositive = parseFloat(percentageChange) >= 0;

  return (
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-900">Earnings Overview</h3>
          <p className="text-sm text-forest-600">Track your farm's revenue</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C5A30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0C5A30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE9" />
            <XAxis 
              dataKey="name" 
              stroke="#68807F"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#68807F"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()} ETB`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8EFE9',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => `${value.toLocaleString()} ETB`}
            />
            <Area 
              type="monotone" 
              dataKey="earnings" 
              stroke="#0C5A30" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-forest-100">
        <div>
          <p className="text-sm text-forest-600">This {timeframe === 'week' ? 'Week' : 'Month'}'s Earnings</p>
          <p className="text-2xl font-bold text-forest-900">{totalEarnings.toLocaleString()} ETB</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-forest-600">Last {timeframe === 'week' ? 'Week' : 'Month'}</p>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-mint-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? '+' : ''}{percentageChange}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;

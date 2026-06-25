import React from 'react';
import { Badge } from '@/components/ui/badge';

const RecentOrders = () => {
  const orders = [
    {
      id: 'ORD1234',
      product: 'Organic Tomatoes',
      image: '🍅',
      price: 2400,
      status: 'Delivered',
      statusColor: 'bg-mint-100 text-mint-700',
    },
    {
      id: 'ORD1235',
      product: 'Fresh Lettuce',
      image: '🥬',
      price: 1800,
      status: 'Shipped',
      statusColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'ORD1236',
      product: 'Carrots',
      image: '🥕',
      price: 3200,
      status: 'Processing',
      statusColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'ORD1237',
      product: 'Green Peppers',
      image: '🫑',
      price: 1500,
      status: 'Placed',
      statusColor: 'bg-forest-100 text-forest-700',
    },
  ];

  return (
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-900">Recent Orders</h3>
          <p className="text-sm text-forest-600">Latest customer orders</p>
        </div>
        <button className="text-sm font-medium text-forest-600 hover:text-forest-900">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-forest-50 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-forest-100 flex items-center justify-center text-xl">
              {order.image}
            </div>
            <div className="flex-1">
              <p className="font-medium text-forest-900">{order.product}</p>
              <p className="text-xs text-forest-600">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-forest-900">{order.price.toLocaleString()} ETB</p>
              <Badge className={order.statusColor}>{order.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;

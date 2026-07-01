import React from 'react';
import { Package } from 'lucide-react';

const TopSellingProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      image: '🍅',
      sold: 120,
      unit: 'kg',
      revenue: 7200,
    },
    {
      id: 2,
      name: 'Fresh Lettuce',
      image: '🥬',
      sold: 85,
      unit: 'kg',
      revenue: 4250,
    },
    {
      id: 3,
      name: 'Carrots',
      image: '🥕',
      sold: 95,
      unit: 'kg',
      revenue: 5700,
    },
    {
      id: 4,
      name: 'Green Peppers',
      image: '🫑',
      sold: 65,
      unit: 'kg',
      revenue: 3900,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Selling Products</h3>
          <p className="text-xs text-muted-foreground">Your best performers</p>
        </div>
        <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
          View All
        </button>
      </div>

      <div className="flex-1 space-y-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors group"
          >
            <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-sm shrink-0">
              {product.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
              <p className="text-[10px] text-muted-foreground">{product.sold} {product.unit} sold</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-slate-900">{product.revenue.toLocaleString()} ETB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingProducts;

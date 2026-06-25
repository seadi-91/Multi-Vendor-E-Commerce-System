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
    <div className="bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-forest-900">Top Selling Products</h3>
          <p className="text-sm text-forest-600">Your best performers</p>
        </div>
        <button className="text-sm font-medium text-forest-600 hover:text-forest-900">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-forest-50 transition-colors"
          >
            <div className="h-12 w-12 rounded-xl bg-forest-100 flex items-center justify-center text-2xl">
              {product.image}
            </div>
            <div className="flex-1">
              <p className="font-medium text-forest-900">{product.name}</p>
              <p className="text-sm text-forest-600">{product.sold} {product.unit} sold</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-forest-900">{product.revenue.toLocaleString()} ETB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingProducts;

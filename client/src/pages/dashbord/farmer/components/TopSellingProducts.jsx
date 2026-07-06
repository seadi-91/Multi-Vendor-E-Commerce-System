import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import api from '../../../../api';

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await api.get('/farmer/products/top-selling');
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to fetch top selling products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Top Selling Products</h3>
            <p className="text-xs text-muted-foreground">Your best performers</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Top Selling Products</h3>
            <p className="text-xs text-muted-foreground">Your best performers</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No sales data available yet.
        </div>
      </div>
    );
  }

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
              {product.image || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
              <p className="text-[10px] text-muted-foreground">{product.sold} {product.unit || 'kg'} sold</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-slate-900">{(product.revenue || 0).toLocaleString()} ETB</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingProducts;

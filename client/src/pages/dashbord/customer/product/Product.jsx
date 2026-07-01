import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../../../api';

const CATEGORY_CONFIG = {
  all: { name: 'All', icon: '🛒' },
  legumes: { name: 'Legumes', icon: '🫘' },
  vegetable: { name: 'Vegetables', icon: '🥦' },
  fruit: { name: 'Fruits', icon: '🍎' },
  livestock: { name: 'Livestock', icon: '🐄' },
  coffee: { name: 'Coffee', icon: '☕' },
  nuts: { name: 'Nuts', icon: '🌰' },
  herbs: { name: 'Herbs', icon: '🌿' },
  grains: { name: 'Grains', icon: '🌾' },
  other: { name: 'Other', icon: '📦' }
};

// Helper to get backend category name from id
const getBackendCategoryName = (categoryId) => {
  const cat = CATEGORY_CONFIG[categoryId];
  return cat ? cat.name : categoryId;
};

const Product = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Set initial category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/projects';
      if (activeCategory !== 'all') {
        const backendCategory = getBackendCategoryName(activeCategory);
        url += `?category=${encodeURIComponent(backendCategory)}`;
      }
      const res = await api.get(url);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
              <option key={key} value={key}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            No products found.
          </div>
        ) : (
          products.map(product => (
            <div
              key={product._id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-44 items-center justify-center bg-slate-50 p-4">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-full w-full max-w-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                    {CATEGORY_CONFIG[product.category]?.icon || '📦'}
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{product.description}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-700">
                    <span>ETB {product.price}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800">{product.stock} {product.unit}</span>
                  </div>
                  <button
                    type="button"
                    className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    onClick={() => alert(`Added ${product.name} to cart!`)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default Product;

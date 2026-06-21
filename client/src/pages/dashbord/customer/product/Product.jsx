import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../../../api';
import './Product.scss';

const CATEGORY_CONFIG = {
  vegetable: { name: 'Vegetables', icon: '🥦' },
  fruit: { name: 'Fruits', icon: '🍎' },
  milk: { name: 'Dairy', icon: '🥛' },
  grains: { name: 'Grains', icon: '🌾' },
  eggs: { name: 'Eggs', icon: '🥚' },
  meat: { name: 'Meat', icon: '🥩' },
  honey: { name: 'Honey', icon: '🍯' },
  other: { name: 'Others', icon: '📦' }
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
    <div className="customer-product-page">
      <div className="category-bar">
        <button
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <button
            key={key}
            className={activeCategory === key ? 'active' : ''}
            onClick={() => setActiveCategory(key)}
          >
            <span className="cat-icon">{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>
      <div className="product-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty">No products found.</div>
        ) : (
          products.map(product => (
            <div className="product-card" key={product._id}>
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="image-placeholder">{CATEGORY_CONFIG[product.category]?.icon || '📦'}</div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-meta">
                  <span>ETB {product.price}</span>
                  <span>{product.stock} {product.unit}</span>
                </div>
                <button className="add-to-cart-btn" onClick={() => alert(`Added ${product.name} to cart!`)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Product;

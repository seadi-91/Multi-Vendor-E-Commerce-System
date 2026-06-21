import React, { useState, useEffect, useRef } from 'react';
import api from '../../../../api.js';
import './AddProduct.scss';

// Category system with dynamic units, using backend enum keys
const CATEGORY_CONFIG = {
  Vegetables: {
    name: 'Vegetables',
    icon: '🥦',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'piece', label: 'Pieces' },
      { value: 'bunch', label: 'Bunches' }
    ]
  },
  Fruits: {
    name: 'Fruits',
    icon: '🍎',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'dozen', label: 'Dozen' },
      { value: 'piece', label: 'Pieces' }
    ]
  },
  Dairy: {
    name: 'Dairy',
    icon: '🥛',
    units: [
      { value: 'liter', label: 'Liters', default: true },
      { value: 'ml', label: 'Milliliters', conversion: 1000 },
      { value: 'packet', label: 'Packets' },
      { value: 'bottle', label: 'Bottles' }
    ]
  },
  Grains: {
    name: 'Grains',
    icon: '🌾',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'sack', label: 'Sacks' },
      { value: 'bag', label: 'Bags' }
    ]
  },
  Eggs: {
    name: 'Eggs',
    icon: '🥚',
    units: [
      { value: 'piece', label: 'Pieces', default: true },
      { value: 'dozen', label: 'Dozen', conversion: 12 },
      { value: 'tray', label: 'Trays', conversion: 30 }
    ]
  },
  Meat: {
    name: 'Meat',
    icon: '🥩',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'piece', label: 'Pieces' }
    ]
  },
  Honey: {
    name: 'Honey',
    icon: '🍯',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'jar', label: 'Jars' }
    ]
  },
  Others: {
    name: 'Others',
    icon: '📦',
    units: [
      { value: 'kg', label: 'Kilograms', default: true },
      { value: 'g', label: 'Grams', conversion: 1000 },
      { value: 'piece', label: 'Pieces' }
    ]
  }
};

// Backend integration

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
    // Fetch products from backend
    useEffect(() => {
      api.get('/api/projects')
        .then(res => setProducts(res.data))
        .catch(() => setProducts([]));
    }, []);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    stock: '',
    unit: 'kg',
    price: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // Update unit and stock when category changes, never touch category
  useEffect(() => {
    // Ensure category is valid, fallback to 'Vegetables' if not
    const validCategory = CATEGORY_CONFIG[formData.category] ? formData.category : 'Vegetables';
    if (validCategory !== formData.category) {
      setFormData(prev => ({ ...prev, category: validCategory }));
      return;
    }

    const categoryConfig = CATEGORY_CONFIG[validCategory];
    if (categoryConfig) {
      const defaultUnit = categoryConfig.units.find(u => u.default) || categoryConfig.units[0];

      setFormData(prev => {
        // When category changes, keep the stock value but update to new category's default unit
        // This preserves the user's input while adapting to the new category's unit system
        return {
          ...prev,
          unit: defaultUnit.value,
          // Keep existing stock value when editing, reset to empty for new products
          stock: editingId ? prev.stock : ''
        };
      });
    }
  }, [formData.category, editingId]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData(prev => ({ ...prev, image: file }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && !value) return;
        if (key === 'stock' || key === 'price') {
          data.append(key, value ? value : 0);
        } else {
          data.append(key, value);
        }
      });
      let res;
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };
      if (editingId) {
        res = await api.put(`/projects/${editingId}`, data, config);
      } else {
        res = await api.post('/projects', data, config);
      }
      // Refresh products
      const productsRes = await api.get('/projects');
      setProducts(productsRes.data);
      resetForm();
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    // Ensure category exists in CATEGORY_CONFIG, fallback to 'Vegetables' if not
    const validCategory = CATEGORY_CONFIG[product.category] ? product.category : 'Vegetables';

    setFormData(prev => ({
      ...prev,
      name: product.name,
      category: validCategory,
      description: product.description,
      stock: product.stock,
      unit: product.unit,
      price: product.price,
      image: product.image // keep current image reference
    }));
    setEditingId(product._id);
    setImagePreview(product.image); // show current image
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('Invalid product ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/projects/${id}`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        // Update local state immediately for better UX
        setProducts(products => products.filter(p => p._id !== id));
        // Also refresh from server to ensure consistency
        const productsRes = await api.get('/projects');
        setProducts(productsRes.data);
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete product. Please try again.');
        // Refresh products list in case of error
        try {
          const productsRes = await api.get('/projects');
          setProducts(productsRes.data);
        } catch (refreshError) {
          console.error('Failed to refresh products:', refreshError);
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      description: '',
      stock: '',
      unit: 'kg',
      price: '',
      image: null
    });
    setEditingId(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const convertStock = (stock, fromUnit, toUnit, category) => {
    // Ensure category is valid, fallback to Vegetables if not
    const validCategory = CATEGORY_CONFIG[category] ? category : 'Vegetables';
    const categoryConfig = CATEGORY_CONFIG[validCategory];

    if (!categoryConfig) return stock;

    const fromConfig = categoryConfig.units.find(u => u.value === fromUnit);
    const toConfig = categoryConfig.units.find(u => u.value === toUnit);

    if (!fromConfig?.conversion || !toConfig?.conversion) return stock;

    // Convert to base unit first, then to target unit
    const baseValue = stock / fromConfig.conversion;
    return baseValue * toConfig.conversion;
  };

  const handleUnitChange = (newUnit) => {
    if (formData.stock && formData.stock.trim() !== '') {
      const convertedStock = convertStock(
        parseFloat(formData.stock),
        formData.unit,
        newUnit,
        formData.category
      );
      setFormData(prev => ({
        ...prev,
        unit: newUnit,
        stock: convertedStock.toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, unit: newUnit }));
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category) => CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Others;

  return (
    <div className="product-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h1>🌱 Farm Product Management</h1>
          <p>Manage your farm products inventory</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <span>+</span> Add New Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="controls-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All Products
          </button>
          {Object.keys(CATEGORY_CONFIG).map(category => (
            <button
              key={category}
              className={`filter-tab ${filterCategory === category ? 'active' : ''}`}
              onClick={() => setFilterCategory(category)}
            >
              {CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].name}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="product-form-section">
          <div className="form-header">
            <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="close-btn" onClick={resetForm}>×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {Object.keys(CATEGORY_CONFIG).map(category => (
                    <option key={category} value={category}>
                      {CATEGORY_CONFIG[category].icon} {CATEGORY_CONFIG[category].name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Quantity */}
              <div className="form-group">
                <label>Stock Quantity *</label>
                <div className="quantity-input-group">
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="unit-selector">
                    <select
                      value={formData.unit}
                      onChange={(e) => handleUnitChange(e.target.value)}
                    >
                      {(CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG.Vegetables).units.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                    <div className="unit-conversion-hint">
                      {(CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG.Vegetables).units
                        .filter(u => u.conversion)
                        .map(u => (
                          <button
                            key={u.value}
                            type="button"
                            className="unit-quick-btn"
                            onClick={() => handleUnitChange(u.value)}
                          >
                            {u.value}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="unit-info">
                  <small>
                    Available units for {(CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG.Vegetables).name.toLowerCase()}: {
                      (CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG.Vegetables).units
                        .map(u => u.label)
                        .join(', ')
                    }
                  </small>
                </div>
              </div>

              {/* Price */}
              <div className="form-group">
                <label>Price (ETB) *</label>
                <div className="price-input">
                  <span className="currency">ETB</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                  <span className="per-unit">/ {formData.unit}</span>
                </div>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product (quality, features, benefits...)"
                  rows="3"
                />
              </div>

              {/* Image Upload */}
              <div className="form-group full-width">
                <label>Product Image</label>
                <div className="image-upload-area">
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleInputChange}
                     className="file-input"
                     id="product-image"
                   />
                   <label htmlFor="product-image" className="upload-label">
                     {imagePreview ? (
                       <img src={imagePreview} alt="Preview" className="image-preview" />
                     ) : (
                       <>
                         <span className="upload-icon">📷</span>
                         <span>Click to upload image</span>
                         <small>JPG, PNG, WebP (Max 5MB)</small>
                       </>
                     )}
                   </label>
                   {/* Remove button only if a new image is selected, not for existing */}
                   {imagePreview && typeof imagePreview !== 'string' && (
                     <button
                       type="button"
                       className="remove-image"
                       onClick={() => {
                         setImagePreview(null);
                         setFormData(prev => ({ ...prev, image: null }));
                       }}
                     >
                       Remove
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>{searchTerm || filterCategory !== 'all' 
              ? 'Try changing your search or filter' 
              : 'Add your first product to get started'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const categoryInfo = getCategoryInfo(product.category);
            
            return (
              <div key={product._id} className="product-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="category-badge">
                    {categoryInfo.icon} {categoryInfo.name}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(product._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Product Image */}
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">
                      {categoryInfo.icon}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-stats">
                    <div className="stat-item">
                      <span className="stat-label">Stock:</span>
                      <span className="stat-value">
                        {product.stock} {product.unit}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Price:</span>
                      <span className="stat-value">ETB {product.price}/{product.unit}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Value:</span>
                      <span className="stat-value">
                        ETB {(product.stock * product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Unit Converter */}
                  <div className="unit-converter">
                    <label>Convert to:</label>
                    <div className="unit-buttons">
                      {categoryInfo.units
                        .filter(u => u.value !== product.unit)
                        .slice(0, 3)
                        .map(unit => {
                          const converted = convertStock(
                            parseFloat(product.stock),
                            product.unit,
                            unit.value,
                            product.category
                          );
                          
                          return (
                            <button
                              key={unit.value}
                              type="button"
                              className="unit-btn"
                              title={`${converted.toFixed(2)} ${unit.value}`}
                            >
                              {unit.value}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <span className="product-id">ID: {product._id}</span>
                  <span className={`status-badge status-${product.status}`}>
                    {product.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{products.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Value</h3>
              <p className="stat-value">
                ETB {products.reduce((sum, p) => sum + (p.stock * p.price), 0).toFixed(2)}
              </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Categories</h3>
            <p className="stat-value">
              {new Set(products.map(p => p.category)).size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
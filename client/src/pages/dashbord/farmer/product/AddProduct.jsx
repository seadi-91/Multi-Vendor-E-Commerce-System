// NOTE: Simplified AddProduct with single-page form layout
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../../../api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, X, Plus, Loader2, Image as ImageIcon, Trash2, Edit2, AlertCircle, Save, Calendar as CalendarIcon, TagIcon, Percent, ArrowLeft, TrendingUp, AlertTriangle, Search, Package, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FilterBar from '../components/FilterBar';

const CATEGORY_CONFIG = {
  Vegetables: { icon: '🥦', units: ['kg', 'g', 'piece', 'bunch'] },
  Fruits:     { icon: '🍎', units: ['kg', 'g', 'dozen', 'piece'] },
  Dairy:      { icon: '🥛', units: ['liter', 'ml', 'packet', 'bottle'] },
  Grains:     { icon: '🌾', units: ['kg', 'g', 'sack', 'bag'] },
  Eggs:       { icon: '🥚', units: ['piece', 'dozen', 'tray'] },
  Meat:       { icon: '🥩', units: ['kg', 'g', 'piece'] },
  Honey:      { icon: '🍯', units: ['kg', 'g', 'jar'] },
  Others:     { icon: '📦', units: ['kg', 'g', 'piece'] },
};

const EMPTY_FORM = {
  name: '',
  brand: '',
  sku: '',
  category: 'Vegetables',
  customCategory: '',
  subCategory: '',
  tags: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  totalStock: '',
  minOrderQuantity: '1',
  unit: 'kg',
  isOrganic: false,
  harvestDate: '',
  expiryDate: '',
  image: null,
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-medium text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900 leading-none">{value}</p>
      {sub && <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ProductManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showForm, setShowForm] = useState(location.pathname.endsWith('/add'));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ category: 'All', status: 'All', search: '' });
  const [currentStep, setCurrentStep] = useState(1);

  const STEPS = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Details', icon: '📋' },
    { id: 3, title: 'Pricing', icon: '💰' },
    { id: 4, title: 'Media', icon: '🖼️' },
    { id: 5, title: 'Review', icon: '✅' },
  ];

  useEffect(() => {
    setShowForm(location.pathname.endsWith('/add'));
    // Check for search query from navigation state
    if (location.state?.searchQuery) {
      setFilters(prev => ({ ...prev, search: location.state.searchQuery }));
    }
  }, [location.pathname, location.state]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/farmer/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load inventory.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const units = CATEGORY_CONFIG[formData.category]?.units || ['kg'];
    if (!units.includes(formData.unit)) {
      setFormData(prev => ({ ...prev, unit: units[0] }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (key !== 'image') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        await api.put(`/farmer/products/${editingId}`, data);
        setSuccess('Product successfully updated!');
      } else {
        await api.post('/farmer/products', data);
        setSuccess('New product added to inventory!');
      }

      await fetchProducts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product. Please check your inputs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '', brand: product.brand || '', sku: product.sku || '',
      category: product.category || 'Vegetables', customCategory: product.customCategory || '', subCategory: product.subCategory || '',
      tags: (product.tags || []).join(', '),
      description: product.description || '', price: product.price || '', discountPrice: product.discountPrice || '',
      stock: product.stock || '', totalStock: product.totalStock || product.stock || '',
      minOrderQuantity: product.minOrderQuantity || '1', unit: product.unit || 'kg', isOrganic: product.isOrganic || false,
      harvestDate: product.harvestDate ? new Date(product.harvestDate).toISOString().split('T')[0] : '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      image: null,
    });
    setImagePreview(product.image || null);
    setEditingId(product.id);
    setShowForm(true);
    setCurrentStep(1);
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      console.log('Deleting product with ID:', id);
      await api.delete(`/farmer/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSuccess('Product permanently deleted.');
      await fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product.');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setImagePreview(null);
    setShowForm(false);
    setError(''); setSuccess('');
    setCurrentStep(1);
    if (location.pathname.endsWith('/add')) navigate('/farmer/products');
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(filters.search.toLowerCase()) || (p.sku || '').toLowerCase().includes(filters.search.toLowerCase());
    const matchCat = filters.category === 'All' || p.category === filters.category;
    const matchStatus = filters.status === 'All' || p.status === filters.status;
    return matchSearch && matchCat && matchStatus;
  });

  // Derived Stats
  const totalValue = products.reduce((sum, p) => sum + (Number(p.stock) * Number(p.price)), 0);
  const lowStockCount = products.filter(p => Number(p.stock) < 10).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 w-full space-y-4">
      
      {/* ── Header ── */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${showForm ? 'max-w-3xl' : 'max-w-5xl'} mx-auto w-full`}>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {showForm ? (editingId ? 'Edit Product' : 'Add New Product') : 'Inventory Management'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {showForm ? 'Provide detailed information to make your product stand out.' : 'Manage your farm products, pricing, and stock.'}
          </p>
        </div>
        {!showForm ? (
          <Button onClick={() => { resetForm(); navigate('/farmer/products/add'); }} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg px-4 h-9 text-sm transition-all">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetForm} disabled={submitting} className="h-9 rounded-lg px-4 border-slate-200 text-sm rounded-md">
              <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm h-9 rounded-lg px-6 text-sm transition-all">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        )}
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className={`flex items-center gap-3 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 shadow-sm animate-in slide-in-from-top-2 ${showForm ? 'max-w-3xl' : 'max-w-5xl'} mx-auto w-full`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-semibold text-xs flex-1">{error}</p>
          <button onClick={() => setError('')}><X className="w-3.5 h-3.5 hover:text-red-900" /></button>
        </div>
      )}
      {success && (
        <div className={`flex items-center gap-3 bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 shadow-sm animate-in slide-in-from-top-2 ${showForm ? 'max-w-3xl' : 'max-w-5xl'} mx-auto w-full`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="font-semibold text-xs flex-1">{success}</p>
          <button onClick={() => setSuccess('')}><X className="w-3.5 h-3.5 hover:text-emerald-900" /></button>
        </div>
      )}

      {/* ── Add / Edit Form (Wizard) ── */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible animate-in fade-in zoom-in-95 duration-200 hover:shadow-md transition-all relative z-10 max-w-3xl mx-auto">
          {/* Wizard Progress */}
          <div className="bg-slate-50 border-b border-slate-200 p-3">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                      currentStep > step.id ? 'bg-emerald-500 text-white' :
                      currentStep === step.id ? 'bg-slate-900 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {currentStep > step.id ? '✓' : step.icon}
                    </div>
                    <span className={`text-[9px] font-medium mt-1 ${
                      currentStep === step.id ? 'text-slate-900' : 'text-slate-500'
                    }`}>{step.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 overflow-visible">
            <form id="product-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Basic Information</h2>
                    <p className="text-slate-500 text-xs mt-1">Provide the primary identity for your product.</p>
                  </div>
                  <div className="grid gap-4">
                    {/* Row 1: Product Name and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Product Name <span className="text-red-500">*</span></Label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Organic Heirloom Tomatoes" required className="h-9 bg-slate-50 text-sm rounded-md" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Category <span className="text-red-500">*</span></Label>
                        {formData.category === 'Others' ? (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">📦</span>
                            <Input
                              name="customCategory"
                              value={formData.customCategory}
                              onChange={handleChange}
                              placeholder="Type your category name..."
                              required
                              autoFocus
                              className="h-9 bg-white text-sm rounded-md pl-9 border-emerald-400 ring-1 ring-emerald-300"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, category: 'Vegetables', customCategory: '' }))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs underline"
                            >
                              ← back
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                              {CATEGORY_CONFIG[formData.category]?.icon || '📦'}
                            </span>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              required
                              className="h-9 w-full rounded-md border border-input bg-slate-50 pl-9 pr-8 text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              {Object.keys(CATEGORY_CONFIG).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Row 2: Brand and Subcategory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Brand / Farm Name</Label>
                        <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Green Valley Farms" className="h-9 bg-slate-50 text-sm rounded-md" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Subcategory (Optional)</Label>
                        <Input name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g., Tomatoes, Leafy Greens, Dairy Products" className="h-9 bg-slate-50 text-sm rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details & Specifications */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Details & Specifications</h2>
                    <p className="text-slate-500 text-xs mt-1">Add rich descriptions and harvest information.</p>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium text-xs">Product Description</Label>
                      <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the key features, freshness, and origin..." rows={4} className="resize-y bg-slate-50 p-3 text-sm rounded-md" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium text-xs">Search Tags</Label>
                      <div className="relative">
                        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input name="tags" value={formData.tags} onChange={handleChange} placeholder="fresh, local, premium (comma separated)" className="pl-10 h-9 bg-slate-50 text-sm" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Harvest Date</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input name="harvestDate" type="date" value={formData.harvestDate} onChange={handleChange} className="pl-10 h-9 bg-white text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Expiry Date</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="pl-10 h-9 bg-white text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div>
                        <Label className="text-emerald-900 font-medium text-xs">Certified Organic</Label>
                        <p className="text-xs text-emerald-700 mt-0.5">Enable this if your product is officially certified organic.</p>
                      </div>
                      <Switch checked={formData.isOrganic} onCheckedChange={(c) => handleSelectChange('isOrganic', c)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Inventory */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Pricing & Inventory</h2>
                    <p className="text-slate-500 text-xs mt-1">Set your price and available stock quantities.</p>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Standard Price <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-slate-400 text-xs">ETB</span>
                          <Input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required className="pl-10 h-9 bg-white font-mono text-sm" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Discount Price</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input name="discountPrice" type="number" min="0" step="0.01" value={formData.discountPrice} onChange={handleChange} className="pl-9 h-9 bg-white font-mono text-sm" placeholder="0.00" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Available Stock <span className="text-red-500">*</span></Label>
                        <div className="flex gap-2">
                          <Input name="stock" type="number" min="0" step="0.01" value={formData.stock} onChange={handleChange} required className="h-9 bg-slate-50 font-mono text-sm" placeholder="0" />
                          <div className="relative">
                            <select
                              name="unit"
                              value={formData.unit}
                              onChange={handleChange}
                              className="h-9 w-[100px] rounded-md border border-input bg-slate-50 px-3 pr-7 text-sm font-medium text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              {(CATEGORY_CONFIG[formData.category]?.units || ['kg']).map(u => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Min. Order Quantity <span className="text-red-500">*</span></Label>
                        <Input name="minOrderQuantity" type="number" min="1" step="1" value={formData.minOrderQuantity} onChange={handleChange} required className="h-9 bg-slate-50 font-mono text-sm" placeholder="1" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">SKU (Optional)</Label>
                        <Input name="sku" value={formData.sku} onChange={handleChange} className="h-9 bg-slate-50 font-mono text-sm" placeholder="e.g., TOM-001" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-medium text-xs">Total Stock Capacity</Label>
                        <Input name="totalStock" type="number" min="0" step="0.01" value={formData.totalStock} onChange={handleChange} className="h-9 bg-slate-50 font-mono text-sm" placeholder="e.g., 500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Product Media */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Product Media</h2>
                    <p className="text-slate-500 text-xs mt-1">Upload a high-quality image of your product.</p>
                  </div>
                  <div className="max-w-xl">
                    <div className="relative group rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 transition-all overflow-hidden">
                      <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id="product-image" />
                      <div className="flex flex-col items-center justify-center p-6 text-center min-h-[220px]">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3 transition-transform duration-300">
                              <ImageIcon className="w-7 h-7 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Click or drag image to upload</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">High quality JPG, PNG, WebP (Max 5MB)</p>
                          </>
                        )}
                      </div>
                      {imagePreview && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-sm">
                          <p className="text-white font-semibold flex items-center gap-2 text-xs"><ImageIcon className="w-3.5 h-3.5"/> Replace Image</p>
                        </div>
                      )}
                    </div>
                    {imagePreview && (
                      <Button type="button" variant="ghost" className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium text-xs" onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}>
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Publish */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Review & Publish</h2>
                    <p className="text-slate-500 text-xs mt-1">Review your product information before publishing.</p>
                  </div>
                  <div className="grid gap-4 bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Product Name</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">
                          {formData.category === 'Others' 
                            ? (formData.customCategory || 'Not provided') 
                            : `${CATEGORY_CONFIG[formData.category]?.icon} ${formData.category}`}
                        </p>
                      </div>
                      {formData.subCategory && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subcategory</p>
                          <p className="font-medium text-slate-900 mt-1 text-sm">{formData.subCategory}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Brand</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.brand || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SKU</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.sku || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Price</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">ETB {formData.price || '0'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Stock</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.stock || '0'} {formData.unit}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.description || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tags</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.tags || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Organic</p>
                        <p className="font-medium text-slate-900 mt-1 text-sm">{formData.isOrganic ? 'Yes' : 'No'}</p>
                      </div>
                      {imagePreview && (
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Product Image</p>
                          <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg border border-slate-200" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="h-9 rounded-lg px-4 border-slate-200 text-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Previous
                </Button>
                
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
                    className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 px-6 text-sm transition-all"
                  >
                    Next <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm h-9 rounded-lg px-6 text-sm transition-all"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? 'Save Changes' : 'Publish Product'}
                  </Button>
                )}
              </div>

            </form>
          </div>
        </div>
      ) : (
        /* ── Inventory List View ── */
        <div className="space-y-4 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
          
          {/* Stats Row */}
          {!loadingProducts && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={Package} label="Total Products" value={products.length} color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={TrendingUp} label="Inventory Value" value={`ETB ${totalValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} color="bg-emerald-50 text-emerald-600" />
              <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={lowStockCount} color="bg-amber-50 text-amber-600" />
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <FilterBar 
              filters={filters} 
              setFilters={setFilters} 
              categories={Object.keys(CATEGORY_CONFIG)}
              statuses={['pending', 'approved', 'rejected']} 
            />

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-3" />
                <p className="text-slate-500 font-medium text-xs">Loading inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">No products found</h3>
                <p className="text-slate-500 font-medium text-xs mt-1 mb-4 max-w-sm">
                  {filters.search || filters.category !== 'All' || filters.status !== 'All' ? 'Try adjusting your filters.' : 'Your inventory is empty.'}
                </p>
                {!(filters.search || filters.category !== 'All' || filters.status !== 'All') && (
                  <Button onClick={() => { resetForm(); navigate('/farmer/products/add'); }} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 h-9 shadow-sm text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add Your First Product
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map(product => {
                        const catConfig = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.Others;
                        const statusColor = product.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                            product.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200';
                        
                        return (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm border border-slate-200">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-lg">{catConfig.icon}</span>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900 text-sm">{product.name}</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    {product.sku && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{product.sku}</span>}
                                    {catConfig.icon} {product.category}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`${statusColor} font-medium capitalize px-2.5 py-1 rounded-md text-xs`}>
                                {product.status || 'pending'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 text-sm">{(product.price || 0).toFixed(2)} <span className="text-xs font-medium text-muted-foreground">ETB</span></div>
                              <div className="text-xs text-muted-foreground mt-0.5">per {product.unit}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-slate-900 text-sm">{product.stock} <span className="text-xs font-medium text-muted-foreground">{product.unit}</span></div>
                                {Number(product.stock) < 10 && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 font-medium px-2 py-0.5 rounded-md text-[10px]">
                                    Low
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEdit(product)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit Product
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Product
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-muted-foreground">
                      Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{filteredProducts.length}</span> of <span className="font-medium text-slate-900">{filteredProducts.length}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-md text-xs">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled className="h-8 px-3 rounded-md text-xs">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
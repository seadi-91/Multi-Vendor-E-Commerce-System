import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, ChevronLeft, MapPin, Mail, Phone, BadgeCheck, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const fmt = (n) => Number(n).toFixed(2);

const Stars = ({ value, size = 'w-4 h-4', className = '' }) => (
  <div className={`flex gap-0.5 ${className}`}>
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  // Review form state (must be declared unconditionally to preserve hook order)
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Handle page theme styles compatibility
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.style.setProperty('--background', 'oklch(0.145 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--card', 'oklch(0.205 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--popover', 'oklch(0.205 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.269 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--muted', 'oklch(0.269 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.708 0 0)');
        root.style.setProperty('--accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
        root.style.setProperty('--border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--input', 'oklch(1 0 0 / 15%)');
        root.style.setProperty('--ring', 'oklch(0.556 0 0)');
        root.style.setProperty('--sidebar', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else {
        root.style.setProperty('--background', 'oklch(1 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--card', 'oklch(1 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--popover', 'oklch(1 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.97 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.205 0 0)');
        root.style.setProperty('--muted', 'oklch(0.97 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.556 0 0)');
        root.style.setProperty('--accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.205 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.577 0.245 27.325)');
        root.style.setProperty('--border', 'oklch(0.922 0 0)');
        root.style.setProperty('--input', 'oklch(0.922 0 0)');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(0.922 0 0)');
        root.style.setProperty('--sidebar-ring', '#059669');
      }
    } else {
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--card');
      root.style.removeProperty('--card-foreground');
      root.style.removeProperty('--popover');
      root.style.removeProperty('--popover-foreground');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--secondary-foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--muted-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
      root.style.removeProperty('--destructive');
      root.style.removeProperty('--border');
      root.style.removeProperty('--input');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--sidebar-foreground');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-primary-foreground');
      root.style.removeProperty('--sidebar-accent');
      root.style.removeProperty('--sidebar-accent-foreground');
      root.style.removeProperty('--sidebar-border');
      root.style.removeProperty('--sidebar-ring');
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load product data and favorites status from DB
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data?.data || null);

        // Fetch user's database favorites list to restore state correctly on reload
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const favsRes = await api.get('/favorites');
            const favs = favsRes.data?.data || [];
            const isFav = favs.some((f) => String(f.id) === String(id));
            setIsFavorite(isFav);
          } catch (err) {
            console.error('Error checking favorite status:', err);
            const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
            setIsFavorite(saved.includes(Number(id)) || saved.includes(String(id)));
          }
        } else {
          const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
          setIsFavorite(saved.includes(Number(id)) || saved.includes(String(id)));
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error('Failed to load product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    setSelectedImage(0);
  }, [id]);

  const toggleFavorite = async () => {
    // Keep local storage synchronized
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newSaved;
    if (isFavorite) {
      newSaved = saved.filter((f) => String(f) !== String(id));
    } else {
      newSaved = [...saved, String(id)];
    }
    localStorage.setItem('favorites', JSON.stringify(newSaved));
    setIsFavorite(!isFavorite);

    // Save in DB if logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (isFavorite) {
          await api.delete(`/favorites/${id}`);
          toast.success('Removed from wishlist');
        } else {
          await api.post('/favorites/add', { productId: id });
          toast.success('Added to wishlist!');
        }
      } catch (err) {
        console.error('Error updating favorite in database:', err);
        toast.error('Failed to sync wishlist with database.');
      }
    } else {
      toast(isFavorite ? 'Removed from wishlist' : 'Added to wishlist!');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({ ...product, _id: product.id });
      }
      toast.success(`${quantity} ${product.name} added to cart!`);
    }
  };

  const generateDescriptionParagraph = () => {
    if (!product) return '';
    let extra = '';
    if (product.isOrganic) {
      extra += 'This organic certified item ';
    } else {
      extra += 'This item ';
    }
    if (product.farmer?.farmName || product.farmer?.name) {
      extra += `is sourced directly from ${product.farmer.farmName || product.farmer.name}. `;
    }
    if (product.brand) {
      extra += `It is produced by ${product.brand}. `;
    }
    if (product.category) {
      extra += `Category: ${product.category}. `;
    }
    if (product.unit) {
      extra += `Packaged and sold by ${product.unit}. `;
    }
    return `${product.description || ''} ${extra}`.trim();
  };

  const scrollToSection = (section) => {
    setActiveTab(section);
    const target = document.getElementById(`${section}-section`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading Skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
        <Header pageType="product-detail" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-pulse">
          <div className="bg-[var(--card)] rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square sm:aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-5 sm:space-y-6">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2" />
              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Graceful Error Handling
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--background)]">
        <Header pageType="product-detail" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
              <span className="text-2xl">🥕</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Product not found</h2>
            <p className="text-[var(--muted-foreground)] mb-6 text-sm leading-relaxed">
              This listing may have sold out or been removed by the farmer.
            </p>
            <Button onClick={() => navigate('/market')} className="w-full h-11 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 font-bold">
              Back to Market
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const finalPrice = product.discountPrice || product.price;
  const images = [product.image, ...(product.additionalImages || [])].filter(Boolean);

  const reviewCount = product.reviewsCount || 0;
  const averageRating = Number(product.rating || 0).toFixed(1);

  // Compute rating distribution from the database reviews
  const reviews = product.reviews || [];
  const ratingBreakdown = [5, 4, 3, 2, 1].reduce((acc, star) => {
    acc[star] = reviews.filter((r) => Number(r.rating) === star).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 pb-24 lg:pb-0">
      <Header pageType="product-detail" />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-[var(--card)]/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] font-semibold mr-1 sm:hidden transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <Link to="/" className="hidden sm:inline text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Home</Link>
          <span className="hidden sm:inline text-[var(--muted-foreground)]/50">/</span>
          <Link to="/market" className="hidden sm:inline text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Market</Link>
          <span className="hidden sm:inline text-[var(--muted-foreground)]/50">/</span>
          <span className="text-[var(--foreground)] font-semibold truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-6 sm:space-y-10">
        {/* Main Product Card */}
        <Card className="border-0 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-[2rem] overflow-hidden bg-[var(--card)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 p-4 sm:p-8 lg:p-12">
              {/* Product Images View */}
              <div className="space-y-3 sm:space-y-4">
                <div className="relative aspect-square sm:aspect-[4/3] bg-[var(--secondary)] rounded-2xl overflow-hidden shadow-inner group">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2">
                    {discountPercent > 0 && (
                      <div className="bg-rose-500 text-white font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md">
                        {discountPercent}% OFF
                      </div>
                    )}
                    {product.isOrganic && (
                      <div className="bg-emerald-600 text-white font-bold text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md uppercase tracking-wide">
                        Organic
                      </div>
                    )}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible scrollbar-none">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`shrink-0 w-16 h-16 sm:w-auto sm:h-auto rounded-xl overflow-hidden transition-all duration-200 aspect-square ${selectedImage === idx
                          ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]'
                          : 'opacity-70 hover:opacity-100 border border-[var(--border)]'
                          }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="space-y-5 sm:space-y-6 flex flex-col justify-between">
                <div className="space-y-3.5 sm:space-y-4">
                  {product.category && (
                    <span className="inline-block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[var(--primary)]">
                      {product.category}
                    </span>
                  )}

                  {/* Title */}
                  <h1 className="text-xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating Summary Box */}
                  <div className="flex items-center gap-2.5 w-fit">
                    <Stars value={product.rating} size="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm font-bold text-[var(--foreground)]">{averageRating}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">({reviewCount} reviews)</span>
                  </div>

                  {/* Price & Stock info */}
                  <div className="space-y-2 pt-1 sm:pt-2">
                    <div className="flex items-baseline gap-2 sm:gap-2.5 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-black text-[var(--primary)]">${fmt(finalPrice)}</span>
                      {discountPercent > 0 && (
                        <span className="text-base sm:text-lg text-[var(--muted-foreground)] line-through">${fmt(product.price)}</span>
                      )}
                      <span className="text-xs sm:text-sm text-[var(--muted-foreground)] font-semibold">/ {product.unit}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <p className={`text-xs sm:text-sm font-bold ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {product.stock > 0 ? `${product.stock} available in stock` : 'Out of stock'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions (Add to cart & wishlist) — hidden on mobile, replaced by sticky bar */}
                <div className="hidden lg:block space-y-4 pt-4 border-t border-[var(--border)]">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 block">
                      Quantity
                    </label>
                    <div className="inline-flex items-center gap-1 bg-[var(--secondary)] rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg font-bold hover:bg-[var(--card)]"
                        disabled={product.stock === 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-base font-black w-10 text-center text-[var(--foreground)]">
                        {product.stock === 0 ? 0 : quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-9 h-9 rounded-lg font-bold hover:bg-[var(--card)]"
                        disabled={product.stock === 0 || quantity >= product.stock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 h-12 text-sm font-bold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                      disabled={!product.stock}
                    >
                      <ShoppingCart className="w-4.5 h-4.5 mr-2" />
                      Add to Cart · ${fmt(finalPrice * quantity)}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleFavorite}
                      className={`h-12 w-12 rounded-xl transition-all border border-[var(--border)] bg-transparent hover:bg-[var(--secondary)] ${isFavorite
                        ? 'text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary)]/5'
                        : 'text-[var(--muted-foreground)]'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[var(--primary)] text-[var(--primary)]' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs (Description and Reviews) */}
            <div className="border-t border-[var(--border)] bg-[var(--secondary)]/20">
              <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 sm:px-8 lg:px-12 pt-4 overflow-x-auto scrollbar-none">
                  <TabsList className="bg-[var(--secondary)] p-1 rounded-xl w-full overflow-x-auto flex gap-2">
                    <TabsTrigger value="description" className="min-w-[120px] rounded-lg text-[12px] sm:text-sm data-[state=active]:bg-[var(--card)] py-2 px-3 sm:px-4 flex-1 sm:flex-none text-center">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="min-w-[120px] rounded-lg text-[12px] sm:text-sm data-[state=active]:bg-[var(--card)] py-2 px-3 sm:px-4 flex-1 sm:flex-none text-center">
                      Reviews <span className="hidden sm:inline">({reviewCount})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent id="description-section" value="description" className="px-4 sm:px-8 lg:px-12 py-5 sm:py-6 focus-visible:outline-none">
                  <div className="bg-[var(--card)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                      {generateDescriptionParagraph()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent id="reviews-section" value="reviews" className="px-4 sm:px-8 lg:px-12 py-5 sm:py-6 focus-visible:outline-none">
                  <div className="space-y-5 sm:space-y-6">
                    {/* Customer reviews metrics dashboard */}
                    <div className="bg-[var(--card)] p-5 sm:p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-[var(--secondary)]/40 rounded-2xl min-w-[120px] w-full sm:w-auto">
                          <span className="text-4xl font-black text-[var(--primary)]">{averageRating}</span>
                          <Stars value={Number(averageRating)} className="mt-2" />
                          <span className="text-[10px] text-[var(--muted-foreground)] mt-1.5 font-bold uppercase tracking-wider">
                            {reviewCount} reviews
                          </span>
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                            Rating Distribution
                          </h3>
                          {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs text-[var(--muted-foreground)] font-bold w-6">{star}★</span>
                              <div className="flex-1 h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                                  style={{
                                    width: `${reviewCount ? (ratingBreakdown[star] / reviewCount) * 100 : 0}%`
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-[var(--muted-foreground)] font-bold w-8 text-right">
                                {ratingBreakdown[star]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {/* Add Review Form (visible to logged-in users) */}
                      {user ? (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm">
                          <h4 className="text-sm font-bold text-[var(--foreground)]">Rate & write a review</h4>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">Share your experience with this product. Your review will be visible to others.</p>
                          <div className="mt-4">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(s)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewRating(s)}
                                  className="text-2xl sm:text-3xl leading-none transition-transform active:scale-90"
                                >
                                  <span className={s <= (hoverRating || reviewRating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}>★</span>
                                </button>
                              ))}
                              <span className="text-sm font-bold ml-2 text-[var(--foreground)]">{reviewRating} / 5</span>
                            </div>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Write your review here..."
                              className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition-shadow"
                              rows={3}
                            />
                            <div className="mt-3 flex gap-2">
                              <Button
                                onClick={async () => {
                                  if (!user) return navigate('/login');
                                  if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }
                                  setSubmittingReview(true);
                                  try {
                                    await api.post('/reviews', { productId: product.id || product._id || id, rating: reviewRating, comment: reviewComment.trim() });
                                    // Refresh product to get new reviews and counts
                                    const fresh = await api.get(`/products/${id}`);
                                    setProduct(fresh.data?.data || product);
                                    setReviewComment('');
                                    setReviewRating(5);
                                    toast.success('Review submitted');
                                  } catch (err) {
                                    console.error('Submit review failed', err);
                                    toast.error(err.response?.data?.message || 'Failed to submit review');
                                  } finally {
                                    setSubmittingReview(false);
                                  }
                                }}
                                disabled={submittingReview}
                                className="rounded-xl bg-[var(--primary)] text-white font-bold h-10 px-5 hover:bg-[var(--primary)]/90"
                              >
                                {submittingReview ? 'Submitting…' : 'Submit Review'}
                              </Button>
                              <Button variant="outline" onClick={() => { setReviewComment(''); setReviewRating(5); }} className="rounded-xl h-10 px-5">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-sm text-[var(--muted-foreground)]">
                          Please <Link to="/login" className="font-bold text-[var(--primary)]">log in</Link> to write a review.
                        </div>
                      )}
                      {reviews.length > 0 ? (
                        reviews.map((review) => {
                          const reviewerName = review.user?.name || 'Private User';
                          const avatarInitials = reviewerName.charAt(0).toUpperCase();

                          return (
                            <div key={review.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  {review.user?.profileImage ? (
                                    <img
                                      src={review.user.profileImage}
                                      alt={reviewerName}
                                      className="w-10 h-10 rounded-full object-cover border border-[var(--border)] shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                      {avatarInitials}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-[var(--foreground)] truncate">{reviewerName}</p>
                                    <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">
                                      {review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Recently'}
                                    </p>
                                  </div>
                                </div>
                                <Stars value={review.rating} size="w-3.5 h-3.5" className="shrink-0" />
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                {review.comment || 'No comment provided.'}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-8 text-center text-sm text-[var(--muted-foreground)]">
                          No approved reviews yet for this product.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Farmer Information Section */}
        {product.farmer && (
          <div className="bg-[var(--card)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-[var(--border)]/30 space-y-5 sm:space-y-6">
            <div className="border-b border-[var(--border)] pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">Meet the Farmer</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center">
              {/* Profile Pic / Avatar */}
              <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                {product.farmer.profileImage ? (
                  <img
                    src={product.farmer.profileImage}
                    alt={product.farmer.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[var(--primary)] shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner shrink-0">
                    {product.farmer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-[var(--foreground)] text-sm sm:text-lg truncate">{product.farmer.name}</h3>
                    {product.farmer.isVerified && (
                      <Badge className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-2 gap-1">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] font-bold truncate">
                    {product.farmer.farmName}
                  </p>
                  {product.farmer.location && (
                    <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {product.farmer.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-4 flex-1 w-full border-t md:border-t-0 md:border-l border-[var(--border)] pt-5 md:pt-0 md:pl-8">
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Rating</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-[var(--foreground)]">{product.farmer.averageRating || '0.0'}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-bold">({product.farmer.totalReviews})</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Listings</p>
                  <p className="text-base font-black text-[var(--foreground)] mt-1">{product.farmer.totalProducts || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Sales</p>
                  <p className="text-base font-black text-[var(--foreground)] mt-1">{product.farmer.completedSales || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Joined</p>
                  <p className="text-xs font-extrabold text-[var(--foreground)] mt-2">
                    {product.farmer.createdAt
                      ? new Date(product.farmer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {product.farmer.bio && (
              <div className="bg-[var(--secondary)]/40 p-4 rounded-xl text-sm text-[var(--muted-foreground)] italic border border-[var(--border)]/20 leading-relaxed">
                "{product.farmer.bio}"
              </div>
            )}

            {/* Farmer Contact Info (conditional) */}
            {(product.farmer.email || product.farmer.phone || product.farmer.address) && (
              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-x-6 gap-y-2.5">
                {product.farmer.email && (
                  <a
                    href={`mailto:${product.farmer.email}`}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" /> {product.farmer.email}
                  </a>
                )}
                {product.farmer.phone && (
                  <a
                    href={`tel:${product.farmer.phone}`}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> {product.farmer.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* More Products From Farmer Grid */}
        {product.moreProducts && product.moreProducts.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="border-b border-[var(--border)] pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">More from this farmer</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {product.moreProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group flex flex-col bg-[var(--card)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-[var(--secondary)] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-1.5">
                    <div>
                      <h3 className="font-extrabold text-[var(--foreground)] text-xs sm:text-sm line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Stars value={p.rating} size="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="text-[9px] text-[var(--muted-foreground)] font-bold ml-0.5">({p.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[var(--primary)] text-xs sm:text-sm">${fmt(p.discountPrice || p.price)}</span>
                      <Badge
                        variant="outline"
                        className={`text-[8px] font-bold hidden sm:inline-flex ${p.stock > 0
                          ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'text-rose-500 border-rose-200 bg-rose-50/50'
                          }`}
                      >
                        {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Grid */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="border-b border-[var(--border)] pb-3 sm:pb-4">
              <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">You may also like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {product.relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col bg-[var(--card)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <Link to={`/product/${p.id}`} className="relative aspect-[4/3] bg-[var(--secondary)] overflow-hidden block">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
                    <div>
                      <Link to={`/product/${p.id}`}>
                        <h3 className="font-extrabold text-[var(--foreground)] text-xs sm:text-sm line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        <Stars value={p.rating} size="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="text-[9px] text-[var(--muted-foreground)] font-bold ml-0.5">({p.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[var(--primary)] text-xs sm:text-sm">${fmt(p.discountPrice || p.price)}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-semibold">/ {p.unit}</span>
                      </div>
                      <Button
                        onClick={() => {
                          addToCart({ ...p, _id: p.id });
                          toast.success(`${p.name} added to cart!`);
                        }}
                        disabled={!p.stock}
                        className="w-full h-8 text-[10px] sm:text-[11px] font-bold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg shadow-sm"
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* Sticky mobile add-to-cart bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--card)] border-t border-[var(--border)] px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.1)] flex items-center gap-3">
        <div className="inline-flex items-center gap-0.5 bg-[var(--secondary)] rounded-xl p-1 shrink-0">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={product.stock === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--foreground)] disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-black w-7 text-center text-[var(--foreground)]">
            {product.stock === 0 ? 0 : quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={product.stock === 0 || quantity >= product.stock}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--foreground)] disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!product.stock}
          className="flex-1 h-11 text-sm font-bold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl shadow-md"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add · ${fmt(finalPrice * quantity)}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;

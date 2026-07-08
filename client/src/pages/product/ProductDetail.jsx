import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const fmt = (n) => Number(n).toFixed(2);

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

  // Loading Skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
        <Header pageType="product-detail" />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
          <div className="bg-[var(--card)] rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2" />
              <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          </div>
          <div className="bg-[var(--card)] rounded-3xl p-6 space-y-4 shadow-sm border border-[var(--border)]">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
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
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">Product Not Found</h2>
            <p className="text-[var(--muted-foreground)] mb-6 text-sm">
              The product you are looking for might have been removed, or is currently unavailable.
            </p>
            <Button onClick={() => navigate('/market')} className="w-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90">
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
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <Header pageType="product-detail" />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Link to="/" className="hover:text-[var(--primary)]">Home</Link>
          <span>/</span>
          <Link to="/market" className="hover:text-[var(--primary)]">Market</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Main Product Card */}
        <Card className="border-0 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.3)] rounded-3xl overflow-hidden bg-[var(--card)]">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10">
              {/* Product Images View */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-[var(--secondary)] rounded-2xl overflow-hidden shadow-inner">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-rose-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`rounded-xl overflow-hidden transition-all duration-200 aspect-square ${
                          selectedImage === idx
                            ? 'ring-2 ring-[var(--primary)] shadow-md border-2 border-[var(--primary)]'
                            : 'border-2 border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating Summary Box */}
                  <div className="flex items-center gap-3 p-3 bg-[var(--secondary)] rounded-xl border border-[var(--border)] max-w-sm">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[var(--foreground)] text-xs">{averageRating} / 5.0</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] font-semibold">{reviewCount} reviews</span>
                    </div>
                  </div>

                  {/* Price & Stock info */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-[var(--primary)]">{fmt(finalPrice)}</span>
                      {discountPercent > 0 && (
                        <span className="text-lg text-[var(--muted-foreground)] line-through">{fmt(product.price)}</span>
                      )}
                      <span className="text-sm text-[var(--muted-foreground)] font-semibold">/ {product.unit}</span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {product.stock > 0 ? `${product.stock} available in stock` : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions (Add to cart & wishlist) */}
                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2 block">
                      Select Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl font-bold"
                        disabled={product.stock === 0}
                      >
                        -
                      </Button>
                      <span className="text-xl font-black w-10 text-center text-[var(--foreground)]">
                        {product.stock === 0 ? 0 : quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 rounded-xl font-bold"
                        disabled={product.stock === 0 || quantity >= product.stock}
                      >
                        +
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
                      Add to Cart - {fmt(finalPrice * quantity)}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={toggleFavorite}
                      className={`h-12 w-12 rounded-xl transition-all border border-[var(--border)] bg-transparent hover:bg-[var(--secondary)] ${
                        isFavorite
                          ? 'text-[var(--primary)] border-[var(--primary)]/20 bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10'
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
            <div className="border-t border-[var(--border)] bg-[var(--secondary)]/15">
              <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 sm:px-10 pt-4">
                  <TabsList className="bg-[var(--secondary)] p-1 rounded-xl">
                    <TabsTrigger value="description" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-[var(--card)] py-2 px-4">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-[var(--card)] py-2 px-4">
                      Reviews ({reviewCount})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="description" className="px-6 sm:px-10 py-6 focus-visible:outline-none">
                  <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {generateDescriptionParagraph()}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="px-6 sm:px-10 py-6 focus-visible:outline-none">
                  <div className="space-y-6">
                    {/* Customer reviews metrics dashboard */}
                    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-[var(--secondary)]/30 rounded-2xl min-w-[120px]">
                          <span className="text-4xl font-black text-[var(--primary)]">{averageRating}</span>
                          <div className="flex gap-0.5 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(Number(averageRating)) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
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
                      {reviews.length > 0 ? (
                        reviews.map((review) => {
                          const reviewerName = review.user?.name || 'Private User';
                          const avatarInitials = reviewerName.charAt(0).toUpperCase();

                          return (
                            <div key={review.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  {review.user?.profileImage ? (
                                    <img
                                      src={review.user.profileImage}
                                      alt={reviewerName}
                                      className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center font-bold text-sm">
                                      {avatarInitials}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-[var(--foreground)]">{reviewerName}</p>
                                    <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">
                                      {review.createdAt
                                        ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Recently'}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 px-2.5 py-1 rounded-lg">
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${
                                          i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed pl-1">
                                {review.comment || 'No comment provided.'}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center text-sm text-[var(--muted-foreground)] shadow-sm">
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
          <div className="bg-[var(--card)] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.3)] rounded-3xl p-6 sm:p-8 border border-[var(--border)]/30 space-y-6">
            <div className="border-b border-[var(--border)] pb-4">
              <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">Farmer Information</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Profile Pic / Avatar */}
              <div className="flex items-center gap-5">
                {product.farmer.profileImage ? (
                  <img
                    src={product.farmer.profileImage}
                    alt={product.farmer.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[var(--primary)] shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-2xl shadow-inner">
                    {product.farmer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-[var(--foreground)] text-base sm:text-lg">{product.farmer.name}</h3>
                    {product.farmer.isVerified && (
                      <Badge className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-2">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] font-bold">
                    Farm: {product.farmer.farmName}
                  </p>
                  {product.farmer.location && (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Location: {product.farmer.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full border-t md:border-t-0 md:border-l border-[var(--border)] pt-6 md:pt-0 md:pl-8">
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Farmer Rating</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-[var(--foreground)]">{product.farmer.averageRating || '0.0'}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-bold">({product.farmer.totalReviews})</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Products Listed</p>
                  <p className="text-base font-black text-[var(--foreground)] mt-1">{product.farmer.totalProducts || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Completed Sales</p>
                  <p className="text-base font-black text-[var(--foreground)] mt-1">{product.farmer.completedSales || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Joined Date</p>
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
              <div className="bg-[var(--secondary)]/40 p-4 rounded-xl text-sm text-[var(--muted-foreground)] italic border border-[var(--border)]/20">
                "{product.farmer.bio}"
              </div>
            )}

            {/* Farmer Contact Info (conditional) */}
            {(product.farmer.email || product.farmer.phone || product.farmer.address) && (
              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-x-6 gap-y-2">
                {product.farmer.email && (
                  <a
                    href={`mailto:${product.farmer.email}`}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center font-semibold transition-colors"
                  >
                    Email: {product.farmer.email}
                  </a>
                )}
                {product.farmer.phone && (
                  <a
                    href={`tel:${product.farmer.phone}`}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center font-semibold transition-colors"
                  >
                    Phone: {product.farmer.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* More Products From Farmer Grid */}
        {product.moreProducts && product.moreProducts.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-[var(--border)] pb-4">
              <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">More Products from this Farmer</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.moreProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group flex flex-col bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-[var(--secondary)] overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-[var(--foreground)] text-sm line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(p.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-[9px] text-[var(--muted-foreground)] font-bold ml-1">({p.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-black text-[var(--primary)] text-sm">{fmt(p.discountPrice || p.price)}</span>
                      <Badge
                        variant="outline"
                        className={`text-[8px] font-bold ${
                          p.stock > 0
                            ? 'text-emerald-500 border-emerald-200 bg-emerald-50/50'
                            : 'text-rose-500 border-rose-200 bg-rose-50/50'
                        }`}
                      >
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
          <div className="space-y-6">
            <div className="border-b border-[var(--border)] pb-4">
              <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {product.relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300"
                >
                  <Link to={`/product/${p.id}`} className="relative aspect-[4/3] bg-[var(--secondary)] overflow-hidden block">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link to={`/product/${p.id}`}>
                        <h3 className="font-extrabold text-[var(--foreground)] text-sm line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                          {p.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(p.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-[9px] text-[var(--muted-foreground)] font-bold ml-1">({p.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-[var(--primary)] text-sm">{fmt(p.discountPrice || p.price)}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] font-semibold">/ {p.unit}</span>
                      </div>
                      <Button
                        onClick={() => {
                          addToCart({ ...p, _id: p.id });
                          toast.success(`${p.name} added to cart!`);
                        }}
                        disabled={!p.stock}
                        className="w-full h-8 text-[11px] font-bold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-lg shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
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
    </div>
  );
};

export default ProductDetail;

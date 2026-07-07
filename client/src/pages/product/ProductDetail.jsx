import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { Heart, Star, ShoppingCart, ChevronLeft, Sprout, Leaf, ArrowRight, Check, Zap, Minus, Plus, MessageSquare, Info, Sparkles, Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const fmt = (n) => Number(n).toFixed(2);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('detail');
  const [reviews, setReviews] = useState([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    // First remove all classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // For system mode, use original bright oklch colors
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

      // Apply original oklch colors based on system preference
      if (systemTheme === 'dark') {
        // Original dark oklch colors with emerald primary
        root.style.setProperty('--background', 'oklch(0.145 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--card', 'oklch(0.205 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--popover', 'oklch(0.205 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--primary', '#059669'); // Emerald green
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
        root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.269 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 10%)');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else {
        // Original light oklch colors with emerald primary
        root.style.setProperty('--background', 'oklch(1 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--card', 'oklch(1 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--popover', 'oklch(1 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--primary', '#059669'); // Emerald green
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
        root.style.setProperty('--ring', '#059669'); // Emerald green
        root.style.setProperty('--sidebar', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.145 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669'); // Emerald green
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.97 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.205 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(0.922 0 0)');
        root.style.setProperty('--sidebar-ring', '#059669'); // Emerald green
      }
    } else {
      // Reset custom styles and use our black/white classes
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ]);
        setProduct(productRes.data?.data || productRes.data || null);
        setReviews(Array.isArray(reviewsRes.data?.data) ? reviewsRes.data.data : []);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }

      const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(saved.includes(Number(id)) || saved.includes(String(id)));
    };
    fetch();
  }, [id]);

  const toggleFavorite = () => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newSaved;
    if (isFavorite) {
      newSaved = saved.filter(f => f !== id && f !== Number(id));
    } else {
      newSaved = [...saved, id];
    }
    localStorage.setItem('favorites', JSON.stringify(newSaved));
    setIsFavorite(!isFavorite);
    toast(isFavorite ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) addToCart({ ...product, _id: product.id });
      toast.success(`${quantity} ${product.name} added to cart!`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--foreground)] text-sm">Loading...</p>
      </div>
    </div>
  );

  const reviewCount = reviews.length || product?.reviewsCount || 0;
  const averageRating = reviewCount
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewCount).toFixed(1)
    : Number(product?.rating || 0).toFixed(1);
  const ratingBreakdown = [5, 4, 3, 2, 1].reduce((acc, star) => {
    acc[star] = reviews.filter((review) => Number(review.rating) === star).length;
    return acc;
  }, {});

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <p className="text-[var(--muted-foreground)] mb-4 text-sm">Product not found</p>
        <Button onClick={() => navigate('/market')}>Back to Market</Button>
      </div>
    </div>
  );

  const discountPercent = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const finalPrice = product.discountPrice || product.price;
  const images = [product.image, ...(product.additionalImages || [])];

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Link to="/" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">Home</Link>
            <ChevronLeft className="w-3 h-3 text-[var(--muted-foreground)] rotate-180" />
            <Link to="/market" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">Market</Link>
            <ChevronLeft className="w-3 h-3 text-[var(--muted-foreground)] rotate-180" />
            <span className="text-[var(--foreground)] font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--border)] shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--secondary)] p-1.5 rounded-full">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate flex-1">{product.name}</h1>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 bg-[var(--secondary)] hover:bg-[var(--border)] rounded-xl transition-all text-[var(--foreground)]">
                    {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
                      <Moon className="w-4.5 h-4.5" />
                    ) : (
                      <Sun className="w-4.5 h-4.5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={toggleFavorite} className="relative hover:text-rose-500">
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[var(--muted-foreground)]'}`} />
              </Button>

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4.5 w-4.5 flex items-center justify-center p-0 text-[8px] bg-[var(--primary)] text-white">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Card className="border border-[var(--border)] shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Images */}
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-[var(--secondary)] rounded-xl overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                      {discountPercent}% OFF
                    </div>
                  )}
                  <button
                    onClick={toggleFavorite}
                    className="absolute top-3 right-3 bg-[var(--card)] p-2 rounded-full shadow-md hover:scale-110 transition-all"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-[var(--muted-foreground)]'}`} />
                  </button>
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`rounded-lg overflow-hidden transition-all hover:scale-105 ${selectedImage === idx
                          ? 'ring-3 ring-[var(--primary)] shadow-md border-2 border-[var(--primary)]'
                          : 'border-2 border-[var(--border)] hover:border-[var(--primary)]'
                          }`}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--foreground)] mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 bg-[var(--secondary)] px-3 py-1.5 rounded-lg">
                      <Sprout className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span className="text-xs font-semibold">{product.farmer?.name}</span>
                    </div>
                    {product.isOrganic && (
                      <Badge className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                        <Leaf className="w-3 h-3 mr-1.5" />
                        Organic
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-[var(--secondary)] rounded-lg border border-[var(--border)]">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-[var(--muted-foreground)]'}`} />
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--foreground)] text-xs">{averageRating} out of 5</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">{reviewCount} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--primary)]">{fmt(finalPrice)}</span>
                    {discountPercent > 0 && <span className="text-xl text-[var(--muted-foreground)] line-through">{fmt(product.price)}</span>}
                    <span className="text-sm text-[var(--muted-foreground)]">/ {product.unit}</span>
                  </div>
                  {product.stock && (
                    <div className="flex items-center gap-1.5">
                      {product.stock > 10 ? <Check className="w-4 h-4 text-[var(--primary)]" /> : product.stock > 0 ? <Zap className="w-4 h-4 text-amber-500" /> : null}
                      <p className={`text-sm font-semibold ${product.stock > 10 ? 'text-[var(--primary)]' : product.stock > 0 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-[var(--foreground)] mb-2 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg">
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-2xl font-black w-12 text-center text-[var(--foreground)]">{quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-12 text-sm font-bold bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-xl shadow-md hover:shadow-lg"
                    disabled={!product.stock}
                  >
                    <ShoppingCart className="w-4.5 h-4.5 mr-2" />
                    Add to Cart - {fmt(finalPrice * quantity)}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-[var(--border)]">
              <Tabs defaultValue="detail" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 sm:px-8 pt-4">
                  <TabsList className="w-full bg-[var(--secondary)]">
                    <TabsTrigger value="detail" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-[var(--card)]">
                      <Leaf className="w-3.5 h-3.5 mr-1.5" />
                      View Detail
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1 text-xs sm:text-sm data-[state=active]:bg-[var(--card)]">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="detail" className="px-6 sm:px-8 py-6">
                  <div className="space-y-6">
                    <div className="bg-[var(--secondary)] p-5 rounded-xl border border-[var(--border)]">
                      <div className="flex items-start gap-3">
                        <div className="bg-[var(--primary)]/10 p-2.5 rounded-lg">
                          <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-[var(--foreground)] mb-1">Premium Quality</h3>
                          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{product.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: Leaf, label: 'Category', value: product.category },
                        { icon: Sprout, label: 'Farm', value: product.farmer?.name },
                        { icon: Check, label: 'Stock', value: product.stock > 10 ? 'In Stock' : product.stock > 0 ? `${product.stock} left` : 'Out', isStatus: true },
                        { icon: Info, label: 'Unit', value: `per ${product.unit}` }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[var(--primary)]/10 p-1.5 rounded-md">
                              <item.icon className="w-3.5 h-3.5 text-[var(--primary)]" />
                            </div>
                            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{item.label}</p>
                          </div>
                          <p className={`text-base font-black ${item.isStatus ? (product.stock > 10 ? 'text-[var(--primary)]' : product.stock > 0 ? 'text-amber-500' : 'text-rose-500') : 'text-[var(--foreground)]'}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="px-6 sm:px-8 py-6">
                  <div className="space-y-6">
                    <div className="bg-[var(--secondary)] p-6 rounded-xl border border-[var(--border)]">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-4xl font-black text-[var(--primary)]">{averageRating}</span>
                          <div className="flex gap-1 mt-2">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-4.5 h-4.5 ${i < Math.floor(Number(averageRating)) ? 'text-amber-500 fill-amber-500' : 'text-[var(--muted-foreground)]'}`} />)}
                          </div>
                          <span className="text-xs text-[var(--muted-foreground)] mt-1 font-semibold">{reviewCount} reviews</span>
                        </div>

                        <div className="flex-1 w-full">
                          <h3 className="text-sm font-extrabold text-[var(--foreground)] mb-3">Customer Feedback</h3>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(star => (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-xs text-[var(--muted-foreground)] w-8">{star}★</span>
                                <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                  <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${reviewCount ? (ratingBreakdown[star] / reviewCount) * 100 : 0}%` }} />
                                </div>
                                <span className="text-[10px] text-[var(--muted-foreground)]">{ratingBreakdown[star]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.length > 0 ? reviews.map(review => {
                        const reviewerName = review.user?.name || review.user?.userName || review.userName || review.user || 'Anonymous';
                        const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : review.date;

                        return (
                          <div key={review.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {reviewerName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[var(--foreground)]">{reviewerName}</p>
                                  <p className="text-[10px] text-[var(--muted-foreground)] font-semibold">{reviewDate}</p>
                                </div>
                              </div>
                              <div className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) =>
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-[var(--muted-foreground)]'}`} />
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{review.comment || 'No comment provided.'}</p>
                          </div>
                        );
                      }) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 text-sm text-[var(--muted-foreground)]">
                          No reviews yet for this product.
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetail;

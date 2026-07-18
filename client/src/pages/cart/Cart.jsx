import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ cartCount, favoritesCount, isOpen, onClose }) => {
  const baseMenuClass = "group flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-[var(--sidebar-foreground)] font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sidebar-primary)]/20 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-primary)]";
  const activeMenuClass = "group flex items-center justify-between rounded-2xl border border-[var(--sidebar-primary)]/20 bg-[var(--sidebar-accent)] px-4 py-3 font-medium text-[var(--sidebar-primary)] shadow-[0_10px_25px_-12px_rgba(5,150,105,0.45)]";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 rounded-r-[32px] border border-[var(--sidebar-border)] bg-[linear-gradient(180deg,var(--sidebar)_0%,var(--sidebar-accent)_100%)] p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out h-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Brand Logo */}
          <div className="mb-6 rounded-[24px] border border-[var(--border)] bg-[var(--card)]/80 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] shadow-md">
                  <span className="text-xl text-[var(--primary-foreground)]">🌾</span>
                </div>
                <h1 className="flex items-center text-lg font-extrabold">
                  <span className="text-[var(--primary)]">Farm</span>
                  <span className="text-[var(--foreground)]">Connect</span>
                </h1>
              </Link>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] lg:hidden"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-[var(--secondary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
              Fresh from Farm to You
            </div>
          </div>

          {/* Core Shopping Sidebar Links */}
          <nav className="space-y-2">
            <NavLink to="/customer/dashboard" end className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🏠</span> <span>Dashboard</span>
              </div>
            </NavLink>

            <NavLink to="/market" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🥗</span> <span>Products</span>
              </div>
            </NavLink>

            <NavLink to="/customer/dashboard/orders" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛍️</span> <span>My Orders</span>
              </div>
            </NavLink>

            <NavLink to="/favorites" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🤍</span> <span>Wishlist</span>
              </div>
              {favoritesCount > 0 && (
                <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-0.5 rounded-full font-bold">{favoritesCount}</span>
              )}
            </NavLink>

            <NavLink to="/customer/cart" className={({ isActive }) => isActive ? activeMenuClass : baseMenuClass} onClick={onClose}>
              <div className="flex items-center gap-3">
                <span className="text-lg">🛒</span> <span>Cart</span>
              </div>
              <span className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-0.5 rounded-full font-bold">{cartCount || 0}</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Promo Card */}
        <div className="relative mt-6 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,var(--primary)/15,var(--secondary))] p-4 shadow-inner">
          <div className="relative z-10">
            <div className="mb-2 inline-flex rounded-full bg-[var(--card)]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">
              Fresh Deals
            </div>
            <h3 className="mb-1 text-base font-bold text-[var(--foreground)]">Save more on seasonal picks</h3>
            <p className="mb-3 max-w-[140px] text-xs text-[var(--muted-foreground)]">Enjoy handpicked farm favorites at special prices.</p>
            <Link to="/" className="inline-flex rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--ring)]">
              Shop Now
            </Link>
          </div>
          <span className="pointer-events-none absolute bottom-[-10px] right-[-10px] text-5xl opacity-80 transition-transform group-hover:scale-110">🧺</span>
        </div>
      </aside>
    </>
  );
};

const Cart = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;

    const applyThemeStyles = currentTheme => {
      root.classList.remove('light', 'dark');
      if (currentTheme === 'dark') {
        root.style.setProperty('--background', 'oklch(0.25 0 0)');
        root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--card', 'oklch(0.30 0 0)');
        root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--popover', 'oklch(0.30 0 0)');
        root.style.setProperty('--popover-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', 'oklch(0.35 0 0)');
        root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--muted', 'oklch(0.35 0 0)');
        root.style.setProperty('--muted-foreground', 'oklch(0.8 0 0)');
        root.style.setProperty('--accent', 'oklch(0.35 0 0)');
        root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--destructive', 'oklch(0.704 0.191 22.216)');
        root.style.setProperty('--border', 'oklch(1 0 0 / 20%)');
        root.style.setProperty('--input', 'oklch(1 0 0 / 25%)');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', 'oklch(0.30 0 0)');
        root.style.setProperty('--sidebar-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', 'oklch(0.35 0 0)');
        root.style.setProperty('--sidebar-accent-foreground', 'oklch(0.985 0 0)');
        root.style.setProperty('--sidebar-border', 'oklch(1 0 0 / 20%)');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else if (currentTheme === 'light') {
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#000000');
        root.style.setProperty('--card', '#ffffff');
        root.style.setProperty('--card-foreground', '#000000');
        root.style.setProperty('--popover', '#ffffff');
        root.style.setProperty('--popover-foreground', '#000000');
        root.style.setProperty('--primary', '#059669');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--secondary', '#f3f4f6');
        root.style.setProperty('--secondary-foreground', '#000000');
        root.style.setProperty('--muted', '#f3f4f6');
        root.style.setProperty('--muted-foreground', '#6b7280');
        root.style.setProperty('--accent', '#f3f4f6');
        root.style.setProperty('--accent-foreground', '#000000');
        root.style.setProperty('--destructive', '#dc2626');
        root.style.setProperty('--border', '#e5e7eb');
        root.style.setProperty('--input', '#e5e7eb');
        root.style.setProperty('--ring', '#059669');
        root.style.setProperty('--sidebar', '#ffffff');
        root.style.setProperty('--sidebar-foreground', '#000000');
        root.style.setProperty('--sidebar-primary', '#059669');
        root.style.setProperty('--sidebar-primary-foreground', '#ffffff');
        root.style.setProperty('--sidebar-accent', '#f3f4f6');
        root.style.setProperty('--sidebar-accent-foreground', '#000000');
        root.style.setProperty('--sidebar-border', '#e5e7eb');
        root.style.setProperty('--sidebar-ring', '#059669');
      } else {
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
          root.style.setProperty('--ring', '#059669');
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
      }
    };

    applyThemeStyles(theme);
    localStorage.setItem('theme', theme);

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => applyThemeStyles('system');
    mediaQuery.addEventListener?.('change', handleSystemChange);
    return () => mediaQuery.removeEventListener?.('change', handleSystemChange);
  }, [theme]);

  const { cart, removeFromCart, cartCount, incrementQuantity, decrementQuantity, clearCart, updateQuantity } = useCart();
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-xl font-semibold text-[var(--foreground)]">Loading...</div>
      </div>
    );
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = JSON.parse(localStorage.getItem('favorites') || '[]').length;

  const handleCheckout = () => {
    if (loading) {
      // Optionally show a spinner or prevent action until auth state is resolved
      return;
    }
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/customer/checkout' } });
      return;
    }
    navigate('/customer/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header pageType="cart" />
        <div className="max-w-2xl mx-auto bg-[var(--card)]/95 rounded-3xl border border-[var(--border)] p-2 md:p-3 text-[var(--foreground)] mt-2.5 md:mt-5 mb-2.5 md:mb-5 mx-2.5 md:mx-auto">
          <div className="mb-6 border-b border-[var(--border)] pb-3 text-center">
            <h1 className="mb-1 text-xl font-extrabold text-[var(--foreground)] md:text-2xl">Your Shopping Cart</h1>
            {cart.length > 0 && (
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-[var(--foreground)]">
              <div className="inline-flex items-center justify-center mx-auto mb-4 h-20 w-20 rounded-3xl bg-[var(--secondary)] text-[var(--primary)]">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-[var(--foreground)]">Your cart is empty</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Add some delicious items to get started!</p>
              <button
                className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-lg text-xs font-semibold"
                onClick={() => navigate('/market')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
              <div className="flex flex-col gap-4 items-center w-full">
                {cart.map(item => (
                  <div
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-2 p-2 pr-10 md:pr-2 bg-[var(--card)] rounded-2xl border border-[var(--border)] relative max-w-xl w-full"
                    key={item._id}
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden bg-[var(--secondary)]/80 flex-shrink-0 mx-auto md:mx-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-[var(--secondary)] text-[var(--primary)]">
                          🍕
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col text-center md:text-left min-w-0 w-full">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-1 mb-0.5">
                        <h3 className="text-xs md:text-sm font-bold text-[var(--foreground)] line-clamp-1">{item.name}</h3>
                        <span className="bg-[var(--secondary)] text-[var(--primary)] px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[var(--muted-foreground)] mb-1.5 text-[10px] break-words whitespace-normal w-full">
                        {item.description || 'Delicious item waiting for you!'}
                      </p>

                      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-[var(--secondary)] rounded-full px-1 py-0.5">
                          <button
                            className="w-5 h-5 rounded-full bg-[var(--card)] text-[var(--foreground)] text-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                            onClick={() => decrementQuantity(item._id)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock || 99}
                            value={item.quantity}
                            onChange={(e) => {
                              let val = parseInt(e.target.value) || 1;
                              if (val < 1) val = 1;
                              if (val > (item.stock || 99)) val = item.stock || 99;
                              updateQuantity(item._id, val);
                            }}
                            className="font-bold text-[var(--foreground)] w-[28px] h-5 text-center text-xs bg-transparent border-0 outline-none"
                          />
                          <button
                            className="w-5 h-5 rounded-full bg-[var(--card)] text-[var(--foreground)] text-xs cursor-pointer flex items-center justify-center disabled:opacity-50"
                            onClick={() => incrementQuantity(item._id, item.stock || 99)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                          <span className="text-[10px] text-[var(--muted-foreground)]">{item.price} ETB</span>
                          <span className="text-xs font-extrabold text-[var(--foreground)]">{item.price * item.quantity} ETB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="bg-transparent text-[var(--destructive)] border-none w-7 h-7 rounded-full text-lg cursor-pointer flex items-center justify-center absolute top-2 right-2 md:static"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="sticky top-5">
                  <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-3 text-[var(--foreground)]">
                    <h3 className="mb-3 border-b border-[var(--border)] pb-1.5 text-sm font-extrabold text-[var(--foreground)]">Order Summary</h3>

                    <div className="flex justify-between mb-2 text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Subtotal ({itemCount} items)</span>
                      <span className="font-semibold text-[var(--foreground)] text-xs">{total} ETB</span>
                    </div>

                    <div className="flex justify-between mb-2 text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Delivery Fee</span>
                      <span className="font-semibold text-[var(--foreground)] text-xs">50 ETB</span>
                    </div>

                    <div className="flex justify-between mb-2 text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Tax</span>
                      <span className="font-semibold text-[var(--foreground)] text-xs">{(total * 0.15).toFixed(2)} ETB</span>
                    </div>
                    <div className="h-px bg-[var(--border)] my-2"></div>

                    <div className="flex justify-between items-center my-3">
                      <span className="text-xs font-bold text-[var(--foreground)]">Total</span>
                      <span className="text-base font-black text-[var(--primary)]">
                        {(total + 50 + total * 0.15).toFixed(2)} ETB
                      </span>
                    </div>
                    <button
                      className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2 rounded-lg text-xs font-bold mb-2"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      className="w-full bg-transparent text-[var(--destructive)] border border-[var(--destructive)] py-1.5 rounded-lg text-[10px] font-semibold"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header pageType="cart" />

      <main className="flex-1 overflow-y-auto">
        <section className="px-6 py-6">
          <div className="mx-auto max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 text-[var(--foreground)] md:p-3">
            <div className="mb-6 border-b border-[var(--border)] pb-3 text-center">
              <h1 className="mb-1 text-xl font-extrabold text-[var(--foreground)] md:text-2xl">Your Shopping Cart</h1>
              {cart.length > 0 && (
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
                </p>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-[var(--foreground)]">
                <div className="mb-4 text-4xl opacity-50">🛒</div>
                <h2 className="mb-2 text-xl font-bold text-[var(--foreground)]">Your cart is empty</h2>
                <p className="mb-6 text-sm text-[var(--muted-foreground)]">Add some delicious items to get started!</p>
                <button
                  className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-xs font-semibold text-[var(--primary-foreground)]"
                  onClick={() => navigate('/market')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                <div className="flex flex-col gap-4 items-center w-full">
                  {cart.map(item => (
                    <div
                      className="relative grid grid-cols-[auto_1fr_auto] gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 pr-10 md:pr-2 md:grid-cols-[auto_1fr_auto] max-w-xl w-full"
                      key={item._id}
                    >
                      <div className="mx-auto h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-[var(--secondary)] md:h-14 md:w-14">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[var(--secondary)] text-2xl text-[var(--primary)]">
                            🍕
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col text-center md:text-left min-w-0 w-full">
                        <div className="mb-0.5 flex flex-col items-center gap-1 md:flex-row md:items-start md:gap-1">
                          <h3 className="text-xs md:text-sm font-bold text-[var(--foreground)] line-clamp-1">{item.name}</h3>
                          <span className="rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                            {item.category}
                          </span>
                        </div>
                        <p className="mb-1.5 text-[10px] text-[var(--muted-foreground)] break-words whitespace-normal w-full">
                          {item.description || 'Delicious item waiting for you!'}
                        </p>

                        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
                          <div className="flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-1 py-0.5">
                            <button
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--card)] text-xs text-[var(--foreground)] disabled:opacity-50"
                              onClick={() => decrementQuantity(item._id)}
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock || 99}
                              value={item.quantity}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 1;
                                if (val < 1) val = 1;
                                if (val > (item.stock || 99)) val = item.stock || 99;
                                updateQuantity(item._id, val);
                              }}
                              className="min-w-[28px] h-5 text-center text-xs font-bold text-[var(--foreground)] bg-transparent border-0 outline-none"
                            />
                            <button
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--card)] text-xs text-[var(--foreground)] disabled:opacity-50"
                              onClick={() => incrementQuantity(item._id, item.stock || 99)}
                              aria-label="Increase quantity"
                              disabled={item.quantity >= (item.stock || 99)}
                            >
                              +
                            </button>
                          </div>
                          <div className="flex flex-col items-center md:items-end">
                            <span className="text-[10px] text-[var(--muted-foreground)]">{item.price} ETB</span>
                            <span className="text-xs font-extrabold text-[var(--foreground)]">{item.price * item.quantity} ETB</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-lg text-[var(--destructive)] md:static"
                        onClick={() => removeFromCart(item._id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="sticky top-5">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-[var(--foreground)]">
                    <h3 className="mb-3 border-b border-[var(--border)] pb-1.5 text-sm font-extrabold text-[var(--foreground)]">Order Summary</h3>

                    <div className="mb-2 flex justify-between text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Subtotal ({itemCount} items)</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">{total} ETB</span>
                    </div>

                    <div className="mb-2 flex justify-between text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Delivery Fee</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">50 ETB</span>
                    </div>

                    <div className="mb-2 flex justify-between text-[var(--foreground)]">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Tax</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">{(total * 0.15).toFixed(2)} ETB</span>
                    </div>
                    <div className="my-2 h-px bg-[var(--border)]"></div>

                    <div className="my-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--foreground)]">Total</span>
                      <span className="text-base font-black text-[var(--primary)]">
                        {(total + 50 + total * 0.15).toFixed(2)} ETB
                      </span>
                    </div>
                    <button
                      className="mb-2 w-full rounded-lg border-none bg-[var(--primary)] py-2 text-xs font-bold text-[var(--primary-foreground)]"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      className="w-full rounded-lg border border-[var(--destructive)] bg-transparent py-1.5 text-[10px] font-semibold text-[var(--destructive)]"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

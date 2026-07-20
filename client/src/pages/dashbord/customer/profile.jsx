import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Package, Heart, Star, Store, Copy,
  Check, X, ShoppingBag, ArrowLeft, Loader2, ChevronRight, Plus,
} from 'lucide-react';
import api, { customerAPI, favoritesAPI } from '../../../api';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

/*
  ── Design notes ─────────────────────────────────────────────
  Palette:
    ink       #12172B  (page background — deep marketplace-ledger navy)
    inkSoft   #1C2340  (raised panels on ink)
    paper     #FBF8F1  (card background — warm receipt paper)
    gold      #C9A227  (brass accent — stamps, dividers, active states)
    goldDeep  #8B6F1D  (pressed / hover)
    slate     #6B7280  (secondary text on paper)
    cream     #EDE7D9  (secondary text on ink)
    success   #2F7D5D
    coral     #C1494B
  Type:
    Display  → 'Fraunces'        (ticket serial, name, section titles)
    Body     → 'Inter'           (everything else)
    Mono     → 'IBM Plex Mono'   (IDs, order numbers, amounts)
  Signature:
    The profile identity card is styled as a torn marketplace
    "membership ticket" — a stub + counterfoil split by a dashed
    tear-line with punched notches, the way a physical market
    vendor stall pass or receipt is printed.
  ─────────────────────────────────────────────────────────────
*/

const getThemeColors = (resolvedTheme) => {
  const isDark = resolvedTheme === 'dark';
  return {
    background: isDark ? '#0f172a' : '#f8fafc',
    card: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    cardDim: isDark ? '#334155' : '#f1f5f9',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    primary: '#10b981', // emerald-500
    primaryDeep: '#059669', // emerald-600
    accent: isDark ? '#fbbf24' : '#d97706', // amber
    accentDeep: isDark ? '#f59e0b' : '#b45309',
    success: '#10b981',
    danger: '#ef4444',
  };
};

// ---- Mock data (swap for customerAPI.getProfile() / useAuth() in production) ----
const MOCK_USER = {
  id: 'CUS-224871',
  name: 'Selam Bekele',
  email: 'selam.bekele@example.com',
  phone: '+251 91 234 5678',
  city: 'Addis Ababa',
  subcity: 'Bole',
  fullAddress: 'Bole Road, near Edna Mall, House No. 14',
  tier: 'Gold Member',
  memberSince: 'Mar 2023',
};

const MOCK_STATS = [
  { label: 'Orders placed', value: 0, icon: Package },
  { label: 'Wishlist items', value: 0, icon: Heart },
  { label: 'Vendors followed', value: 0, icon: Store },
  { label: 'Reviews written', value: 0, icon: Star },
];

const MOCK_ORDERS = [];

const MOCK_ADDRESSES = [];

function useCopy() {
  const [copiedKey, setCopiedKey] = useState('');
  const copy = (key, text) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(text).catch(() => { });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1500);
  };
  return { copiedKey, copy };
}

const Fonts = ({ colors }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Fraunces', serif; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'IBM Plex Mono', monospace; }
    .tear-divider {
      background-image: repeating-linear-gradient(to bottom, ${colors.textSecondary}55 0 6px, transparent 6px 14px);
      width: 2px;
    }
    .notch { position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${colors.background}; }
    .stat-tile:hover { transform: translateY(-2px); }
    .order-row:hover { background: ${colors.cardDim}; }
    .fade-in { animation: fadeIn 0.35s ease both; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    ::selection { background: ${colors.accent}55; }
  `}</style>
);

const Tab = ({ active, onClick, children, icon: Icon, colors }) => (
  <button
    onClick={onClick}
    className="f-body"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 18px',
      borderRadius: 999,
      fontSize: 13.5,
      fontWeight: 600,
      letterSpacing: 0.2,
      border: `1px solid ${active ? colors.primary : colors.border}`,
      background: active ? colors.primary : 'transparent',
      color: active ? colors.card : colors.textPrimary,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      whiteSpace: 'nowrap',
    }}
  >
    <Icon size={15} />
    {children}
  </button>
);

const StatTile = ({ icon: Icon, label, value, colors }) => (
  <div
    className="stat-tile"
    style={{
      background: colors.card,
      borderRadius: 14,
      padding: '16px 16px',
      border: `1px solid ${colors.border}`,
      transition: 'transform 0.18s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={colors.primary} />
      </div>
    </div>
    <p className="f-mono" style={{ fontSize: 24, fontWeight: 600, color: colors.textPrimary, lineHeight: 1 }}>{value}</p>
    <p className="f-body" style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>{label}</p>
  </div>
);

const CopyField = ({ icon: Icon, label, value, copyKey, copiedKey, onCopy, colors }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: colors.cardDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} color={colors.accentDeep} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p className="f-body" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textSecondary }}>{label}</p>
      <p className="f-mono" style={{ fontSize: 13.5, color: colors.textPrimary, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
    <button
      onClick={() => onCopy(copyKey, value)}
      title="Copy"
      style={{
        width: 30, height: 30, borderRadius: 8, border: `1px solid ${colors.border}`,
        background: copiedKey === copyKey ? colors.success : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.15s ease',
      }}
    >
      {copiedKey === copyKey ? <Check size={14} color="#fff" /> : <Copy size={14} color={colors.textSecondary} />}
    </button>
  </div>
);

const MembershipTicket = ({ user, colors }) => {
  const initials = useMemo(() => {
    if (!user?.name) return '??';
    return user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  }, [user?.name]);

  const tierLabel = (user?.tier || 'Member').toUpperCase();
  const displayName = user?.name || 'Customer';
  const memberSince = user?.memberSince || 'N/A';
  const emailValue = user?.email || 'Not provided';
  const phoneValue = user?.phone || 'Not provided';
  const userId = user?.id || 'N/A';

  return (
    <div style={{
      position: 'relative', display: 'flex', background: colors.card, borderRadius: 18,
      overflow: 'visible', boxShadow: '0 14px 34px rgba(0,0,0,0.15)',
    }}>
      <div className="notch" style={{ left: -13, top: '50%', transform: 'translateY(-50%)' }} />
      <div className="notch" style={{ right: -13, top: '50%', transform: 'translateY(-50%)' }} />

      {/* Stub */}
      <div style={{
        width: 168, flexShrink: 0, padding: '22px 16px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center',
      }}>
        <div style={{
          width: 58, height: 58, borderRadius: '50%', background: colors.background,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="f-display" style={{ color: colors.primary, fontSize: 20 }}>{initials}</span>
        </div>
        <span className="f-mono" style={{
          fontSize: 10, letterSpacing: 0.8, color: colors.primaryDeep, background: 'rgba(16,185,129,0.15)',
          padding: '4px 9px', borderRadius: 999, fontWeight: 600,
        }}>
          {tierLabel}
        </span>
        <p className="f-body" style={{ fontSize: 10.5, color: colors.textSecondary }}>Member since {memberSince}</p>
      </div>

      <div className="tear-divider" />

      {/* Counterfoil */}
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p className="f-body" style={{ fontSize: 10.5, letterSpacing: 1, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>Marketplace pass</p>
            <h2 className="f-display" style={{ fontSize: 24, color: colors.textPrimary, marginTop: 2, lineHeight: 1.15 }}>{displayName}</h2>
            <p className="f-mono" style={{ fontSize: 12.5, color: colors.primaryDeep, marginTop: 4 }}>{userId}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: colors.textSecondary }}>
            <Mail size={13} color={colors.primaryDeep} /> {emailValue}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: colors.textSecondary }}>
            <Phone size={13} color={colors.primaryDeep} /> {phoneValue}
          </span>
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ user, stats, copiedKey, onCopy, colors }) => (
  <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
    {[
      { label: 'Orders placed', value: stats.orders, icon: Package },
      { label: 'Wishlist items', value: stats.wishlist, icon: Heart },
      { label: 'Vendors followed', value: stats.vendors, icon: Store },
      { label: 'Reviews written', value: stats.reviews, icon: Star },
    ].map((s) => <StatTile key={s.label} {...s} colors={colors} />)}
    <div style={{ gridColumn: '1 / -1', background: colors.card, borderRadius: 16, padding: '6px 16px', border: `1px solid ${colors.border}`, marginTop: 4 }}>
      <p className="f-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: colors.textSecondary, textTransform: 'uppercase', padding: '12px 4px 0' }}>Contact details</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <CopyField icon={User} label="Customer ID" value={user.id} copyKey="id" copiedKey={copiedKey} onCopy={onCopy} colors={colors} />
        <div style={{ height: 1, background: colors.border }} />
        <CopyField icon={Mail} label="Email address" value={user.email} copyKey="email" copiedKey={copiedKey} onCopy={onCopy} colors={colors} />
        <div style={{ height: 1, background: colors.border }} />
        <CopyField icon={Phone} label="Phone number" value={user.phone} copyKey="phone" copiedKey={copiedKey} onCopy={onCopy} colors={colors} />
      </div>
    </div>
  </div>
);

const OrdersTab = ({ orders, colors }) => {
  const orderCount = orders.length;
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Delivered': return { bg: 'rgba(16,185,129,0.15)', fg: colors.success };
      case 'In transit': return { bg: 'rgba(245,158,11,0.15)', fg: colors.accentDeep };
      case 'Cancelled': return { bg: 'rgba(239,68,68,0.15)', fg: colors.danger };
      default: return { bg: colors.cardDim, fg: colors.textSecondary };
    }
  };

  return (
    <div className="fade-in" style={{ background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${colors.border}` }}>
        <div>
          <p className="f-body" style={{ fontSize: 11, letterSpacing: 0.7, color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>All orders</p>
          <p className="f-display" style={{ fontSize: 20, color: colors.textPrimary, margin: 0 }}>{orderCount} order{orderCount === 1 ? '' : 's'}</p>
        </div>
      </div>
      {orderCount ? orders.map((o, i) => {
        const st = getStatusStyle(o.status);
        const statusText = o.status || 'Unknown';
        return (
          <div key={o.id || o.orderCode || i} className="order-row" style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            borderBottom: i < orderCount - 1 ? `1px solid ${colors.border}` : 'none',
            transition: 'background 0.15s ease',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.cardDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShoppingBag size={16} color={colors.accentDeep} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="f-body" style={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary }}>{o.vendor}</p>
              <p className="f-mono" style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>{o.orderCode || o.id} · {o.date}</p>
            </div>
            <span className="f-body" style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 999, background: st.bg, color: st.fg, flexShrink: 0 }}>
              {statusText}
            </span>
            <p className="f-mono" style={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary, width: 78, textAlign: 'right', flexShrink: 0 }}>
              {o.total.toLocaleString()} ETB
            </p>
            <ChevronRight size={16} color={colors.textSecondary} style={{ flexShrink: 0 }} />
          </div>
        );
      }) : (
        <div style={{ padding: 24, textAlign: 'center', color: colors.textSecondary }}>
          <p className="f-body" style={{ fontSize: 14, marginBottom: 8 }}>No orders found yet.</p>
          <p className="f-body" style={{ fontSize: 12 }}>Your order history will appear here once you place an order.</p>
        </div>
      )}
    </div>
  );
};

const AddressesTab = ({ addresses, showAddressForm, addressForm, setAddressForm, onAddAddress, onToggleForm, onCancelForm, addressSaving, colors }) => (
  <div className="fade-in" style={{ display: 'grid', gap: 12 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {addresses.map((a) => {
        const fullAddress = a.fullAddress || a.street || a.address || '';
        const city = a.city || '';
        const subcity = a.subcity || '';
        const label = a.label || 'Address';
        return (
          <div key={a.id || label} style={{ background: colors.card, borderRadius: 16, padding: 18, border: `1px solid ${colors.border}`, position: 'relative' }}>
            {a.isDefault && (
              <span className="f-body" style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: colors.primaryDeep, background: 'rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: 999 }}>
                DEFAULT
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MapPin size={16} color={colors.primaryDeep} />
              <p className="f-display" style={{ fontSize: 16, color: colors.textPrimary }}>{label}</p>
            </div>
            <p className="f-body" style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>
              {fullAddress}<br />{subcity}{city ? `, ${city}` : ''}
            </p>
          </div>
        );
      })}
    </div>

    {showAddressForm ? (
      <form onSubmit={onAddAddress} style={{ background: colors.card, borderRadius: 16, padding: 18, border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Label</label>
              <input
                value={addressForm.label}
                onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.textPrimary, outline: 'none', background: colors.card }}
                placeholder="Home"
              />
            </div>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>City</label>
              <input
                value={addressForm.city}
                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.textPrimary, outline: 'none', background: colors.card }}
                placeholder="Addis Ababa"
              />
            </div>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sub-city</label>
              <input
                value={addressForm.subcity}
                onChange={(e) => setAddressForm((f) => ({ ...f, subcity: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.textPrimary, outline: 'none', background: colors.card }}
                placeholder="Bole"
              />
            </div>
          </div>
          <div>
            <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full address</label>
            <textarea
              value={addressForm.fullAddress}
              onChange={(e) => setAddressForm((f) => ({ ...f, fullAddress: e.target.value }))}
              className="f-body"
              style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${colors.border}`, fontSize: 14, color: colors.textPrimary, outline: 'none', background: colors.card, minHeight: 90, resize: 'vertical' }}
              placeholder="House number, street, landmark"
            />
          </div>
          <label className="f-body" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textSecondary }}>
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default address
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={addressSaving} className="f-body" style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: colors.primary, color: colors.card, fontWeight: 600, cursor: 'pointer' }}>
              {addressSaving ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={onCancelForm} className="f-body" style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textPrimary, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    ) : (
      <button onClick={onToggleForm} className="f-body" style={{
        background: 'transparent', border: `1.5px dashed ${colors.border}`, borderRadius: 16, minHeight: 110,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        color: colors.textSecondary, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>
        <Plus size={18} /> Add new address
      </button>
    )}
  </div>
);

const Profile = () => {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const colors = getThemeColors(resolvedTheme);
  const [customerData, setCustomerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [tab, setTab] = useState('overview');
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: 'Home', fullAddress: '', city: '', subcity: '', isDefault: false });
  const [addressSaving, setAddressSaving] = useState(false);
  const { copiedKey, copy } = useCopy();

  const normalizeOrders = (rawOrders = []) => rawOrders.map((order) => {
    const createdAt = new Date(order.createdAt || order.updatedAt || Date.now());
    const vendorName = order.vendor
      || order.restaurant
      || order.orderItems?.[0]?.product?.farmer?.farmName
      || order.orderItems?.[0]?.product?.farmer?.name
      || 'Marketplace';
    const statusRaw = order.status || order.paymentStatus || 'Unknown';
    const statusLabel = String(statusRaw).replace(/^./, (char) => char.toUpperCase());
    const totalAmount = Number(order.total ?? order.subtotal ?? ((order.deliveryFee || 0) + (order.tax || 0))) || 0;

    return {
      id: order.id || order.orderCode || `${Math.random()}`,
      orderCode: order.orderCode || `ORD-${String(order.id || '').padStart(5, '0')}`,
      vendor: vendorName,
      date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: statusLabel,
      total: totalAmount,
      raw: order,
    };
  });

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setProfileError('');

      const [profileRes, addressesRes, ordersRes, favoritesRes, reviewsRes] = await Promise.all([
        customerAPI.getProfile(),
        customerAPI.getAddresses(),
        customerAPI.getOrders(),
        favoritesAPI.getFavorites(),
        api.get('/reviews/me'),
      ]);

      setCustomerData(profileRes.data);
      setAddresses(addressesRes.data?.addresses || []);
      setOrders(normalizeOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.data || []));
      setFavorites(Array.isArray(favoritesRes.data?.data) ? favoritesRes.data.data : []);
      setMyReviews(Array.isArray(reviewsRes.data?.data) ? reviewsRes.data.data : []);
    } catch (error) {
      console.error('Error loading profile dashboard data:', error);
      setCustomerData((prev) => prev || null);
      setProfileError(error?.response?.data?.message || 'Unable to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!addressForm.label.trim() || !addressForm.fullAddress.trim() || !addressForm.city.trim() || !addressForm.subcity.trim()) return;

    setAddressSaving(true);
    window.setTimeout(() => {
      const newAddress = { ...addressForm, id: `${Date.now()}` };
      setAddresses((prev) => [newAddress, ...prev]);
      setAddressForm({ label: 'Home', fullAddress: '', city: '', subcity: '', isDefault: false });
      setShowAddressForm(false);
      setAddressSaving(false);
    }, 350);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setAddressForm({ label: 'Home', fullAddress: '', city: '', subcity: '', isDefault: false });
  };

  const displayedUser = customerData || user || MOCK_USER;
  
  return (
    <div className="f-body" style={{ minHeight: '100vh', background: colors.background }}>
      <Header pageType="home" />
      <Fonts colors={colors} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 16px 60px' }}>
        <button
          onClick={handleBack}
          className="f-body"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent',
            border: `1px solid ${colors.border}`, color: colors.textPrimary, borderRadius: 999,
            padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {loading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220,
            color: colors.textPrimary, fontSize: 14,
          }}>
            <Loader2 size={18} className="animate-spin" /> Loading your profile…
          </div>
        ) : (
          <>
            {profileError && (
              <div style={{ background: 'rgba(239,68,68,0.15)', color: colors.danger, borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {profileError}
              </div>
            )}

            {displayedUser ? (
              <MembershipTicket user={displayedUser} colors={colors} />
            ) : (
              <div style={{ background: colors.card, borderRadius: 18, padding: 24, color: colors.textPrimary, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.border}` }}>
                <div style={{ textAlign: 'center' }}>
                  <p className="f-body" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Profile data unavailable</p>
                  <p className="f-body" style={{ fontSize: 14, color: colors.textSecondary }}>{profileError || 'Please refresh the page to try again.'}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 26, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
              <Tab active={tab === 'overview'} onClick={() => setTab('overview')} icon={User} colors={colors}>Overview</Tab>
              <Tab active={tab === 'orders'} onClick={() => setTab('orders')} icon={Package} colors={colors}>Orders</Tab>
              <Tab active={tab === 'addresses'} onClick={() => setTab('addresses')} icon={MapPin} colors={colors}>Addresses</Tab>
            </div>

            {tab === 'overview' && displayedUser && <OverviewTab user={displayedUser} stats={{ orders: orders.length, wishlist: favorites.length, vendors: new Set(favorites.map((item) => item.product?.farmer?.id || item.product?.farmer?.name).filter(Boolean)).size, reviews: myReviews.length }} copiedKey={copiedKey} onCopy={copy} colors={colors} />}
            {tab === 'overview' && !displayedUser && (
              <div style={{ background: colors.card, borderRadius: 16, padding: 20, color: colors.textPrimary, border: `1px solid ${colors.border}` }}>
                <p className="f-body" style={{ fontSize: 14, color: colors.textSecondary }}>Profile details are unavailable right now. Refresh the page to retry.</p>
              </div>
            )}
            {tab === 'orders' && <OrdersTab orders={orders} colors={colors} />}
            {tab === 'addresses' && (
              <AddressesTab
                addresses={addresses}
                showAddressForm={showAddressForm}
                addressForm={addressForm}
                setAddressForm={setAddressForm}
                onAddAddress={handleAddAddress}
                onToggleForm={() => setShowAddressForm(true)}
                onCancelForm={resetAddressForm}
                addressSaving={addressSaving}
                colors={colors}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

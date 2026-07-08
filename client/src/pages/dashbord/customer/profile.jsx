import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useTheme } from '../../../context/ThemeContext';
import api, { customerAPI } from '../../../api';
import {
  User, Mail, Phone, MapPin, Package, Heart, Star, Store, Copy,
  Check, X, ShoppingBag, ArrowLeft, Loader2, ChevronRight, Plus,
} from 'lucide-react';

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

const COLORS = {
  ink: '#12172B',
  inkSoft: '#1C2340',
  inkLine: '#2A3150',
  paper: '#FBF8F1',
  paperDim: '#F1ECDE',
  gold: 'var(--primary)',
  goldDeep: '#10B981',
  slate: '#6B7280',
  cream: '#EDE7D9',
  success: '#2F7D5D',
  coral: '#C1494B',
};

// ---- Static data used only for non-profile-specific sections ----
const MOCK_STATS = [
  { label: 'Orders placed', value: 47, icon: Package },
  { label: 'Wishlist items', value: 12, icon: Heart },
  { label: 'Vendors followed', value: 8, icon: Store },
  { label: 'Reviews written', value: 23, icon: Star },
];

const MOCK_ORDERS = [
  { id: 'ORD-88213', vendor: 'Adera Leather Co.', date: 'Jul 2, 2026', status: 'Delivered', total: 2450 },
  { id: 'ORD-88190', vendor: 'Zema Textiles', date: 'Jun 27, 2026', status: 'In transit', total: 980 },
  { id: 'ORD-88104', vendor: 'Kaldi Roasters', date: 'Jun 14, 2026', status: 'Delivered', total: 640 },
  { id: 'ORD-87996', vendor: 'Habesha Home Decor', date: 'May 30, 2026', status: 'Cancelled', total: 1320 },
];

const normalizeOrder = (order) => {
  const orderDate = new Date(order.createdAt || order.updatedAt || Date.now());
  const date = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return {
    ...order,
    orderNumber: order.orderCode || `ORD-${String(order.id || '').padStart(5, '0')}`,
    date,
    status: order.status || 'processing',
    total: Number(order.total || order.subtotal || 0),
    vendor: order.orderItems?.[0]?.product?.farmer?.name || order.vendor || 'Marketplace',
    orderItems: order.orderItems || order.items || [],
    reviews: order.reviews || [],
  };
};

const MOCK_ADDRESSES = [
  { label: 'Home', city: 'Addis Ababa', subcity: 'Bole', fullAddress: 'Bole Road, near Edna Mall, House No. 14', isDefault: true },
  { label: 'Office', city: 'Addis Ababa', subcity: 'Kirkos', fullAddress: 'Dembel City Center, 4th Floor, Suite 402', isDefault: false },
];

const STATUS_STYLE = {
  'Delivered': { bg: 'rgba(47,125,93,0.12)', fg: COLORS.success },
  'In transit': { bg: 'rgba(5,150,105,0.12)', fg: COLORS.goldDeep },
  'Cancelled': { bg: 'rgba(193,73,75,0.12)', fg: COLORS.coral },
};

function useCopy() {
  const [copiedKey, setCopiedKey] = useState('');
  const copy = (key, text) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(text).catch(() => { });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1500);
  };
  return { copiedKey, copy };
}

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    .f-display { font-family: 'Fraunces', serif; }
    .f-body { font-family: 'Inter', sans-serif; }
    .f-mono { font-family: 'IBM Plex Mono', monospace; }
    .tear-divider {
      background-image: repeating-linear-gradient(to bottom, ${COLORS.slate}55 0 6px, transparent 6px 14px);
      width: 2px;
    }
    .notch { position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${COLORS.ink}; }
    .stat-tile:hover { transform: translateY(-2px); }
    .order-row:hover { background: ${COLORS.paperDim}; }
    .fade-in { animation: fadeIn 0.35s ease both; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    ::selection { background: #05966955; }
  `}</style>
);

const Tab = ({ active, onClick, children, icon: Icon }) => (
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
      border: `1px solid ${active ? COLORS.gold : COLORS.inkLine}`,
      background: active ? COLORS.gold : 'transparent',
      color: active ? COLORS.ink : COLORS.cream,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      whiteSpace: 'nowrap',
    }}
  >
    <Icon size={15} />
    {children}
  </button>
);

const StatTile = ({ icon: Icon, label, value }) => (
  <div
    className="stat-tile"
    style={{
      background: COLORS.paper,
      borderRadius: 16,
      padding: '14px 14px',
      border: `1px solid ${COLORS.paperDim}`,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={COLORS.gold} />
      </div>
    </div>
    <p className="f-mono" style={{ fontSize: 24, fontWeight: 600, color: COLORS.ink, lineHeight: 1 }}>{value}</p>
    <p className="f-body" style={{ fontSize: 12, color: COLORS.slate, marginTop: 6 }}>{label}</p>
  </div>
);

const CopyField = ({ icon: Icon, label, value, copyKey, copiedKey, onCopy }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.paperDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} color={COLORS.goldDeep} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p className="f-body" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.slate }}>{label}</p>
      <p className="f-mono" style={{ fontSize: 13.5, color: COLORS.ink, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
    </div>
    <button
      onClick={() => onCopy(copyKey, value)}
      title="Copy"
      style={{
        width: 30, height: 30, borderRadius: 8, border: `1px solid ${COLORS.paperDim}`,
        background: copiedKey === copyKey ? COLORS.success : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        transition: 'all 0.15s ease',
      }}
    >
      {copiedKey === copyKey ? <Check size={14} color="#fff" /> : <Copy size={14} color={COLORS.slate} />}
    </button>
  </div>
);

const MembershipTicket = ({ user }) => {
  const initials = useMemo(() => {
    const name = user?.name || 'Customer';
    return name.split(' ').map((s) => s[0] || '').slice(0, 2).join('').toUpperCase();
  }, [user?.name]);

  const tierLabel = (user?.tier || 'Member').toUpperCase();
  const memberSinceLabel = user?.memberSince || 'Unknown';

  return (
    <div style={{
      position: 'relative', display: 'flex', background: COLORS.paper, borderRadius: 20,
      overflow: 'visible', boxShadow: '0 8px 24px rgba(2,6,23,0.08)',
    }}>
      <div className="notch" style={{ left: -13, top: '50%', transform: 'translateY(-50%)' }} />
      <div className="notch" style={{ right: -13, top: '50%', transform: 'translateY(-50%)' }} />

      {/* Stub */}
      <div style={{
        width: 168, flexShrink: 0, padding: '22px 18px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: COLORS.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${COLORS.gold}`,
          boxShadow: '0 6px 18px rgba(2,6,23,0.12)',
        }}>
          <span className="f-display" style={{ color: COLORS.gold, fontSize: 20 }}>{initials}</span>
        </div>
        <span className="f-mono" style={{
          fontSize: 10, letterSpacing: 0.8, color: COLORS.goldDeep, background: 'rgba(5,150,105,0.12)',
          padding: '4px 9px', borderRadius: 999, fontWeight: 600,
        }}>
          {tierLabel}
        </span>
        <p className="f-body" style={{ fontSize: 10.5, color: COLORS.slate }}>Member since {memberSinceLabel}</p>
      </div>

      <div className="tear-divider" />

      {/* Counterfoil */}
      <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p className="f-body" style={{ fontSize: 10.5, letterSpacing: 1, color: COLORS.slate, textTransform: 'uppercase', fontWeight: 600 }}>Marketplace pass</p>
            <h2 className="f-display" style={{ fontSize: 24, color: COLORS.ink, marginTop: 2, lineHeight: 1.15 }}>{user.name}</h2>
            <p className="f-mono" style={{ fontSize: 12.5, color: COLORS.goldDeep, marginTop: 4 }}>{user.id}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: COLORS.slate }}>
            <Mail size={13} color={COLORS.goldDeep} /> {user.email}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: COLORS.slate }}>
            <Phone size={13} color={COLORS.goldDeep} /> {user.phone}
          </span>
        </div>
      </div>
    </div>
  );
};

const OverviewTab = ({ user, orders, copiedKey, onCopy }) => {
  const totalReviews = orders.reduce((count, order) => count + (order.reviews?.length || 0), 0);
  const uniqueVendors = new Set(
    orders.flatMap((order) => order.orderItems?.map((item) => item.product?.farmer?.id).filter(Boolean) || [])
  ).size;

  const stats = [
    { label: 'Orders placed', value: orders.length, icon: Package },
    { label: 'Wishlist items', value: user?.wishlistCount ?? 0, icon: Heart },
    { label: 'Vendors followed', value: uniqueVendors, icon: Store },
    { label: 'Reviews written', value: totalReviews, icon: Star },
  ];

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
      {stats.map((s) => <StatTile key={s.label} {...s} />)}
      <div style={{ gridColumn: '1 / -1', background: COLORS.paper, borderRadius: 16, padding: '6px 16px', border: `1px solid ${COLORS.paperDim}`, marginTop: 4 }}>
        <p className="f-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: COLORS.slate, textTransform: 'uppercase', padding: '12px 4px 0' }}>Contact details</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <CopyField icon={User} label="Customer ID" value={user.id || 'N/A'} copyKey="id" copiedKey={copiedKey} onCopy={onCopy} />
          <div style={{ height: 1, background: COLORS.paperDim }} />
          <CopyField icon={Mail} label="Email address" value={user.email || 'N/A'} copyKey="email" copiedKey={copiedKey} onCopy={onCopy} />
          <div style={{ height: 1, background: COLORS.paperDim }} />
          <CopyField icon={Phone} label="Phone number" value={user.phone || 'N/A'} copyKey="phone" copiedKey={copiedKey} onCopy={onCopy} />
        </div>
      </div>
    </div>
  );
};

const OrdersTab = ({ orders }) => (
  <div className="fade-in" style={{ background: COLORS.paper, borderRadius: 16, border: `1px solid ${COLORS.paperDim}`, overflow: 'hidden' }}>
    {(orders.length === 0 ? MOCK_ORDERS : orders).map((o, i) => {
      const st = STATUS_STYLE[o.status] || STATUS_STYLE['In transit'];
      return (
        <div key={o.id || o.orderNumber || i} className="order-row" style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
          borderBottom: i < MOCK_ORDERS.length - 1 ? `1px solid ${COLORS.paperDim}` : 'none',
          transition: 'background 0.15s ease',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.paperDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingBag size={16} color={COLORS.goldDeep} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="f-body" style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink }}>{o.vendor}</p>
            <p className="f-mono" style={{ fontSize: 11.5, color: COLORS.slate, marginTop: 2 }}>{o.id} · {o.date}</p>
          </div>
          <span className="f-body" style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 999, background: st.bg, color: st.fg, flexShrink: 0 }}>
            {o.status}
          </span>
          <p className="f-mono" style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, width: 78, textAlign: 'right', flexShrink: 0 }}>
            {o.total.toLocaleString()} ETB
          </p>
          <ChevronRight size={16} color={COLORS.slate} style={{ flexShrink: 0 }} />
        </div>
      );
    })}
  </div>
);

const AddressesTab = ({ addresses, showAddressForm, addressForm, setAddressForm, onAddAddress, onToggleForm, onCancelForm, addressSaving }) => (
  <div className="fade-in" style={{ display: 'grid', gap: 12 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {addresses.map((a) => (
        <div key={a.id || a.label} style={{ background: COLORS.paper, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.paperDim}`, position: 'relative' }}>
          {a.isDefault && (
            <span className="f-body" style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: COLORS.goldDeep, background: 'rgba(5,150,105,0.12)', padding: '3px 8px', borderRadius: 999 }}>
              DEFAULT
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MapPin size={16} color={COLORS.goldDeep} />
            <p className="f-display" style={{ fontSize: 16, color: COLORS.ink }}>{a.label}</p>
          </div>
          <p className="f-body" style={{ fontSize: 13, color: COLORS.slate, lineHeight: 1.6 }}>
            {a.fullAddress}<br />{a.subcity}, {a.city}
          </p>
        </div>
      ))}
    </div>

    {showAddressForm ? (
      <form onSubmit={onAddAddress} style={{ background: COLORS.paper, borderRadius: 16, padding: 18, border: `1px solid ${COLORS.paperDim}` }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>Label</label>
              <input
                value={addressForm.label}
                onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLORS.paperDim}`, fontSize: 14, color: COLORS.ink, outline: 'none', background: '#fff' }}
                placeholder="Home"
              />
            </div>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>City</label>
              <input
                value={addressForm.city}
                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLORS.paperDim}`, fontSize: 14, color: COLORS.ink, outline: 'none', background: '#fff' }}
                placeholder="Addis Ababa"
              />
            </div>
            <div>
              <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sub-city</label>
              <input
                value={addressForm.subcity}
                onChange={(e) => setAddressForm((f) => ({ ...f, subcity: e.target.value }))}
                className="f-body"
                style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLORS.paperDim}`, fontSize: 14, color: COLORS.ink, outline: 'none', background: '#fff' }}
                placeholder="Bole"
              />
            </div>
          </div>
          <div>
            <label className="f-body" style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.slate, textTransform: 'uppercase', letterSpacing: 0.5 }}>Full address</label>
            <textarea
              value={addressForm.fullAddress}
              onChange={(e) => setAddressForm((f) => ({ ...f, fullAddress: e.target.value }))}
              className="f-body"
              style={{ width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLORS.paperDim}`, fontSize: 14, color: COLORS.ink, outline: 'none', background: '#fff', minHeight: 90, resize: 'vertical' }}
              placeholder="House number, street, landmark"
            />
          </div>
          <label className="f-body" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: COLORS.slate }}>
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            Set as default address
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={addressSaving} className="f-body" style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: COLORS.ink, color: COLORS.paper, fontWeight: 600, cursor: 'pointer' }}>
              {addressSaving ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={onCancelForm} className="f-body" style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.paperDim}`, background: 'transparent', color: COLORS.ink, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    ) : (
      <button onClick={onToggleForm} className="f-body" style={{
        background: 'transparent', border: `1.5px dashed ${COLORS.paperDim}`, borderRadius: 16, minHeight: 110,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        color: COLORS.slate, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>
        <Plus size={18} /> Add new address
      </button>
    )}
  </div>
);

const Profile = () => {
  const [customerData, setCustomerData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [tab, setTab] = useState('overview');
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: 'Home', fullAddress: '', city: '', subcity: '', isDefault: false });
  const [addressSaving, setAddressSaving] = useState(false);
  const { copiedKey, copy } = useCopy();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        const [profileRes, addressesRes, ordersRes] = await Promise.all([
          customerAPI.getProfile(),
          customerAPI.getAddresses(),
          api.get('/orders'),
        ]);

        if (!active) return;

        const profile = profileRes.data;
        setCustomerData(profile);

        const storedAddresses = addressesRes.data?.addresses || [];
        const resolvedAddresses = storedAddresses.length > 0
          ? storedAddresses
          : profile.fullAddress || profile.address
            ? [{
              label: 'Home',
              city: profile.city || '',
              subcity: profile.subcity || '',
              fullAddress: profile.fullAddress || profile.address || '',
              isDefault: true,
            }]
            : [];
        setAddresses(resolvedAddresses);

        const serverOrders = Array.isArray(ordersRes.data) ? ordersRes.data.map(normalizeOrder) : [];
        setOrders(serverOrders);
      } catch (error) {
        console.error('Error fetching customer profile or orders:', error);
        if (!active) return;
        setProfileError('Unable to load your profile information. Please refresh the page.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
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

  const pageBackground = resolvedTheme === 'dark' ? COLORS.ink : '#f8fafc';
  const pageTextColor = resolvedTheme === 'dark' ? COLORS.cream : '#111827';

  return (
    <div className="f-body min-h-screen flex flex-col" style={{ background: pageBackground, color: pageTextColor }}>
      <Fonts />
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm">
        <Header pageType="profile" />
      </div>
      <main className="flex-1" style={{ padding: '32px 16px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 20 }}>
          <button
            onClick={handleBack}
            className="f-body"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent',
              border: `1px solid ${COLORS.inkLine}`, color: COLORS.cream, borderRadius: 999,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {loading ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220,
              color: COLORS.cream, fontSize: 14,
            }}>
              <Loader2 size={18} className="animate-spin" /> Loading your profile…
            </div>
          ) : customerData ? (
            <>
              {profileError && (
                <div style={{ background: 'rgba(193,73,75,0.15)', color: '#F3C6C7', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                  {profileError}
                </div>
              )}

              <MembershipTicket user={customerData} />

              <div style={{ display: 'flex', gap: 8, marginTop: 26, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
                <Tab active={tab === 'overview'} onClick={() => setTab('overview')} icon={User}>Overview</Tab>
                <Tab active={tab === 'orders'} onClick={() => setTab('orders')} icon={Package}>Orders</Tab>
                <Tab active={tab === 'addresses'} onClick={() => setTab('addresses')} icon={MapPin}>Addresses</Tab>
              </div>

              {tab === 'overview' && <OverviewTab user={customerData} orders={orders} copiedKey={copiedKey} onCopy={copy} />}
              {tab === 'orders' && <OrdersTab orders={orders} />}
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
                />
              )}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

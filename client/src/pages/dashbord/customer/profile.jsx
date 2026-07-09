import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api, { customerAPI } from '../../../api';
// icons removed to display text-only profile
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400' },
  processing: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400' },
  shipped: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400' },
  delivered: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400' },
  cancelled: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-400' },
};

const normalizeOrder = (o) => ({
  ...o,
  orderNumber: o.orderCode || `#${String(o.id || '').slice(-6).toUpperCase()}`,
  date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  status: (o.status || 'pending').toLowerCase(),
  total: Number(o.total || o.subtotal || 0),
  vendor: o.orderItems?.[0]?.product?.farmer?.name || 'Marketplace',
  itemCount: (o.orderItems || o.items || []).length,
});

const Avatar = ({ src, name, size = 'lg' }) => {
  const initials = (name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const dim = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-10 w-10 text-sm';
  return src ? (
    <img src={src} alt={name} className={`${dim} rounded-full object-cover ring-4 ring-emerald-100 dark:ring-emerald-900/40`} />
  ) : (
    <div className={`${dim} rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white ring-4 ring-emerald-100 dark:ring-emerald-900/40`}>
      {initials}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--foreground)] break-words">{value}</p>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
    <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{value}</p>
    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: '', fullName: '', phone: '', city: '', subcity: '', street: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'dark') {
      root.style.setProperty('--background', 'oklch(0.145 0 0)');
      root.style.setProperty('--foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--card', 'oklch(0.205 0 0)');
      root.style.setProperty('--card-foreground', 'oklch(0.985 0 0)');
      root.style.setProperty('--border', 'oklch(1 0 0 / 10%)');
      root.style.setProperty('--muted-foreground', 'oklch(0.708 0 0)');
      root.style.setProperty('--secondary', 'oklch(0.269 0 0)');
      root.style.setProperty('--primary', '#059669');
    } else {
      root.style.setProperty('--background', '#f8fafc');
      root.style.setProperty('--foreground', '#0f172a');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#0f172a');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--muted-foreground', '#64748b');
      root.style.setProperty('--secondary', '#f1f5f9');
      root.style.setProperty('--primary', '#059669');
    }
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, ordersRes, addressesRes, favsRes] = await Promise.allSettled([
          customerAPI.getProfile(),
          api.get('/orders'),
          customerAPI.getAddresses(),
          api.get('/favorites'),
        ]);

        if (!mounted) return;

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
        }

        if (ordersRes.status === 'fulfilled') {
          const raw = ordersRes.value.data;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          setOrders(list.map(normalizeOrder));
        }

        if (addressesRes.status === 'fulfilled') {
          setAddresses(addressesRes.value.data?.addresses || []);
        }

        if (favsRes.status === 'fulfilled') {
          const raw = favsRes.value.data;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          setFavCount(list.length);
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { label, fullName, phone, city, subcity, street } = addrForm;
    if (!label || !fullName || !phone || !city || !subcity || !street) {
      toast.error('Please fill in all address fields');
      return;
    }
    setSaving(true);
    try {
      const res = await customerAPI.addAddress(addrForm);
      setAddresses((prev) => [...prev, res.data.address]);
      setAddrForm({ label: '', fullName: '', phone: '', city: '', subcity: '', street: '', isDefault: false });
      setShowAddForm(false);
      toast.success('Address saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await customerAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a.id || a._id) !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  const totalReviews = orders.reduce((n, o) => n + (o.reviews?.length || 0), 0);
  const uniqueVendors = new Set(orders.flatMap((o) => o.orderItems?.map((i) => i.product?.farmer?.id).filter(Boolean) || [])).size;

  const tabs = [
    { key: 'info', label: 'Profile Info' },
    { key: 'orders', label: `Orders (${orders.length})` },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header pageType="profile" />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Back
        </button>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-32 text-[var(--muted-foreground)]">
            <span className="text-sm">Loading profile…</span>
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">Could not load profile. Please refresh.</p>
          </div>
        ) : (
          <>
            {/* ── Profile Header Card ── */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <Avatar src={profile.profileImage} name={profile.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-[var(--foreground)]">{profile.name}</h1>
                    {profile.isVerified && (
                      <span className="text-xs font-semibold text-emerald-600">Verified</span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${profile.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700'}`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {profile.username && (
                    <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="mt-2 text-sm text-[var(--foreground)] leading-relaxed max-w-lg">{profile.bio}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--muted-foreground)]">
                    <span>{profile.email}</span>
                    {profile.phone && <span>{profile.phone}</span>}
                    {profile.city && <span>{profile.city}</span>}
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/customer/settings')}
                  className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-emerald-400 transition-colors flex-shrink-0"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Orders" value={orders.length} />
              <StatCard label="Favorites" value={favCount} />
              <StatCard label="Reviews" value={totalReviews} />
              <StatCard label="Vendors" value={uniqueVendors} />
            </div>

            {/* ── Tabs ── */}
            <div className="mt-6 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${tab === t.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Profile Info ── */}
            {tab === 'info' && (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Personal Information</h2>
                <InfoRow label="Full Name" value={profile.name} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow label="City" value={profile.city} />
                <InfoRow label="Sub-city" value={profile.subcity} />
                <InfoRow label="Address" value={profile.fullAddress || profile.address} />
                <InfoRow label="Country" value={profile.country} />
                <InfoRow label="Language" value={profile.language} />
                <InfoRow label="Timezone" value={profile.timezone} />
                <InfoRow label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
                <InfoRow label="Member Since" value={new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                <InfoRow label="Account Status" value={profile.accountStatus} />
                <InfoRow label="Role" value={profile.role} />
              </div>
            )}

            {/* ── Tab: Orders ── */}
            {tab === 'orders' && (
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="mt-3 text-sm text-[var(--muted-foreground)]">No orders yet</p>
                    <button onClick={() => navigate('/market')} className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                      Browse Market
                    </button>
                  </div>
                ) : (
                  orders.map((o, i) => {
                    const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                    return (
                      <div
                        key={o.id || i}
                        onClick={() => navigate(`/customer/orders/${o.id}`)}
                        className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] cursor-pointer transition-colors"
                      >

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--foreground)] truncate">{o.vendor}</p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{o.orderNumber} · {o.date} · {o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${sc.bg} ${sc.text}`}>
                          {o.status}
                        </span>
                        <p className="text-sm font-bold text-[var(--foreground)] w-20 text-right flex-shrink-0">
                          ${o.total.toFixed(2)}
                        </p>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Tab: Addresses ── */}
            {tab === 'addresses' && (
              <div className="mt-4 space-y-3">
                {addresses.length === 0 && !showAddForm && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">No saved addresses</p>
                  </div>
                )}

                {addresses.map((a) => (
                  <div key={a.id || a._id} className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{a.label}</p>
                        {a.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">Default</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {[a.fullName, a.street, a.subcity, a.city].filter(Boolean).join(', ')}
                      </p>
                      {a.phone && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{a.phone}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(a.id || a._id)}
                      className="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex-shrink-0 px-3 py-1 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {showAddForm ? (
                  <form onSubmit={handleAddAddress} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-[var(--foreground)]">New Address</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        { key: 'label', placeholder: 'Label (e.g. Home)' },
                        { key: 'fullName', placeholder: 'Full name' },
                        { key: 'phone', placeholder: 'Phone number' },
                        { key: 'city', placeholder: 'City' },
                        { key: 'subcity', placeholder: 'Sub-city / District' },
                        { key: 'street', placeholder: 'Street / House No.' },
                      ].map(({ key, placeholder }) => (
                        <input
                          key={key}
                          value={addrForm[key]}
                          onChange={(e) => setAddrForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                      <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))} className="accent-emerald-600" />
                      Set as default address
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                        {saving ? 'Saving…' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted-foreground)] hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    Add New Address
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

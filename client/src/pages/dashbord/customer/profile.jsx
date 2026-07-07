import React, { useEffect, useMemo, useState } from 'react';
import {
  User, Mail, Phone, MapPin, Copy, Check, ArrowLeft, Loader2,
  CalendarDays, ShieldCheck, Globe2, BadgeCheck, FileText, Clock3,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { customerAPI } from '../../../api';

/*
  ── Design notes ─────────────────────────────────────────────
  Palette:
    LIGHT MODE:
      ink       #FFFFFF  (page background — white)
      paper     #F5F5F5  (card background — light gray)
      
    DARK MODE:
      ink       #1A1F2E  (page background — dark slate)
      paper     #2A3142  (card background — dark card)
    
    gold      #C9A227  (brass accent — stamps, dividers, active states)
    goldDeep  #8B6F1D  (pressed / hover)
    success   #2F7D5D
    coral     #C1494B
  Type:
    Display  → 'Fraunces'        (ticket serial, name, section titles)
    Body     → 'Inter'           (everything else)
    Mono     → 'IBM Plex Mono'   (IDs, order numbers, amounts)
  ─────────────────────────────────────────────────────────────
*/

const getColors = (theme) => {
  const isDark = theme === 'dark';
  return {
    ink: isDark ? '#1A1F2E' : '#FFFFFF',
    inkSoft: isDark ? '#252E42' : '#F9F9F9',
    inkLine: isDark ? '#3A4454' : '#E5E5E5',
    paper: isDark ? '#2A3142' : '#F5F5F5',
    paperDim: isDark ? '#3A4454' : '#ECECEC',
    gold: '#C9A227',
    goldDeep: '#8B6F1D',
    slate: isDark ? '#FFFFFF' : '#000000',
    cream: isDark ? '#FFFFFF' : '#000000',
    success: '#2F7D5D',
    coral: '#C1494B',
  };
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Not provided';
  return value;
};

const formatDate = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatStatus = (value) => {
  if (value === true) return 'Active';
  if (value === false) return 'Inactive';
  return 'Not provided';
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

const Fonts = ({ COLORS }) => (
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
    ::selection { background: ${COLORS.gold}55; }
  `}</style>
);

const Tab = ({ active, onClick, children, icon: Icon, COLORS }) => (
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
      color: active ? '#FFFFFF' : COLORS.cream,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      whiteSpace: 'nowrap',
    }}
  >
    <Icon size={15} />
    {children}
  </button>
);

const StatTile = ({ icon: Icon, label, value, COLORS }) => (
  <div
    className="stat-tile"
    style={{
      background: COLORS.paper,
      borderRadius: 14,
      padding: '16px 16px',
      border: `1px solid ${COLORS.paperDim}`,
      transition: 'transform 0.18s ease',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={15} color={COLORS.gold} />
      </div>
    </div>
    <p className="f-mono" style={{ fontSize: 24, fontWeight: 600, color: COLORS.cream, lineHeight: 1 }}>{value}</p>
    <p className="f-body" style={{ fontSize: 12, color: COLORS.slate, marginTop: 6 }}>{label}</p>
  </div>
);

const CopyField = ({ icon: Icon, label, value, copyKey, copiedKey, onCopy, COLORS }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px' }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.paperDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} color={COLORS.goldDeep} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p className="f-body" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.slate }}>{label}</p>
      <p className="f-mono" style={{ fontSize: 13.5, color: COLORS.cream, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
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

const ProfileHeader = ({ profile, COLORS, copiedKey, onCopy, initials }) => (
  <div style={{ position: 'relative', display: 'flex', background: COLORS.paper, borderRadius: 18, overflow: 'visible', boxShadow: `0 14px 34px ${COLORS.ink}40` }}>
    <div className="notch" style={{ left: -13, top: '50%', transform: 'translateY(-50%)' }} />
    <div className="notch" style={{ right: -13, top: '50%', transform: 'translateY(-50%)' }} />

    <div style={{ width: 168, flexShrink: 0, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textAlign: 'center' }}>
      <div style={{ width: 58, height: 58, borderRadius: '50%', background: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {profile?.profileImage ? (
          <img src={profile.profileImage} alt={profile?.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <span className="f-display" style={{ color: COLORS.gold, fontSize: 20 }}>{initials}</span>
        )}
      </div>
      <span className="f-mono" style={{ fontSize: 10, letterSpacing: 0.8, color: COLORS.goldDeep, background: 'rgba(201,162,39,0.15)', padding: '4px 9px', borderRadius: 999, fontWeight: 600 }}>
        {formatValue(profile?.role || 'Customer').toUpperCase()}
      </span>
      <p className="f-body" style={{ fontSize: 10.5, color: COLORS.slate }}>{formatStatus(profile?.isActive)}</p>
    </div>

    <div className="tear-divider" />

    <div style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p className="f-body" style={{ fontSize: 10.5, letterSpacing: 1, color: COLORS.slate, textTransform: 'uppercase', fontWeight: 600 }}>Account profile</p>
          <h2 className="f-display" style={{ fontSize: 24, color: COLORS.cream, marginTop: 2, lineHeight: 1.15 }}>{formatValue(profile?.name || 'Your profile')}</h2>
          <p className="f-mono" style={{ fontSize: 12.5, color: COLORS.goldDeep, marginTop: 4 }}>{formatValue(profile?.id || 'N/A')}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: COLORS.slate }}>
          <Mail size={13} color={COLORS.goldDeep} /> {formatValue(profile?.email)}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: COLORS.slate }}>
          <Phone size={13} color={COLORS.goldDeep} /> {formatValue(profile?.phone)}
        </span>
      </div>
      <div style={{ marginTop: 14 }}>
        <CopyField icon={Mail} label="Email address" value={profile?.email || 'Not provided'} copyKey="email" copiedKey={copiedKey} onCopy={onCopy} COLORS={COLORS} />
        <CopyField icon={Phone} label="Phone number" value={profile?.phone || 'Not provided'} copyKey="phone" copiedKey={copiedKey} onCopy={onCopy} COLORS={COLORS} />
      </div>
    </div>
  </div>
);

const ProfileDetails = ({ profile, COLORS }) => {
  const detailRows = [
    { label: 'Username', value: profile?.username, icon: User },
    { label: 'Gender', value: profile?.gender, icon: User },
    { label: 'Date of birth', value: profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided', icon: CalendarDays },
    { label: 'Address', value: profile?.address || profile?.fullAddress || profile?.city, icon: MapPin },
    { label: 'Country', value: profile?.country, icon: Globe2 },
    { label: 'Role', value: profile?.role, icon: ShieldCheck },
    { label: 'Account status', value: formatStatus(profile?.isActive), icon: BadgeCheck },
    { label: 'Bio', value: profile?.bio, icon: FileText },
    { label: 'Registration date', value: profile?.createdAt || profile?.registrationDate ? formatDate(profile.createdAt || profile.registrationDate) : 'Not provided', icon: CalendarDays },
    { label: 'Last login', value: profile?.updatedAt || profile?.lastLogin ? formatDate(profile.updatedAt || profile.lastLogin) : 'Not provided', icon: Clock3 },
  ];

  return (
    <div className="fade-in" style={{ display: 'grid', gap: 12 }}>
      <div style={{ background: COLORS.paper, borderRadius: 16, padding: '18px 18px 8px', border: `1px solid ${COLORS.paperDim}` }}>
        <p className="f-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: COLORS.slate, textTransform: 'uppercase', marginBottom: 12 }}>Profile details</p>
        <div style={{ display: 'grid', gap: 0 }}>
          {detailRows.map((row, index) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: index === 0 ? 'none' : `1px solid ${COLORS.paperDim}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.paperDim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <row.icon size={15} color={COLORS.goldDeep} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="f-body" style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.slate }}>{row.label}</p>
                <p className="f-mono" style={{ fontSize: 13.5, color: COLORS.cream, marginTop: 2, lineHeight: 1.5 }}>{formatValue(row.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { resolvedTheme } = useTheme();
  const COLORS = getColors(resolvedTheme);
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const { copiedKey, copy } = useCopy();

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setProfileError('');
        
        const response = await customerAPI.getProfile();
        
        if (response.data) {
          setProfile(response.data);
        } else {
          setProfileError('Unable to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError(error.response?.data?.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const displayName = profile?.name || user?.name || 'Your profile';
  const initials = useMemo(() => displayName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase() || 'U', [displayName]);

  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
  };

  return (
    <div className="f-body" style={{ minHeight: '100vh', background: COLORS.ink, padding: '28px 16px 60px', transition: 'background-color 0.3s ease' }}>
      <Fonts COLORS={COLORS} />
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button
          onClick={handleBack}
          className="f-body"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent',
            border: `1px solid ${COLORS.inkLine}`, color: COLORS.cream, borderRadius: 999,
            padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20,
            transition: 'all 0.3s ease',
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 220, color: COLORS.cream, fontSize: 14 }}>
            <Loader2 size={18} className="animate-spin" /> Loading your profile…
          </div>
        ) : profileError ? (
          <div style={{ background: 'rgba(193,73,75,0.15)', color: '#F3C6C7', borderRadius: 12, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
            {profileError}
          </div>
        ) : profile ? (
          <>
            <ProfileHeader profile={profile} COLORS={COLORS} copiedKey={copiedKey} onCopy={copy} initials={initials} />
            <div style={{ marginTop: 18 }}>
              <ProfileDetails profile={profile} COLORS={COLORS} />
            </div>
          </>
        ) : (
          <div style={{ background: 'rgba(193,73,75,0.15)', color: '#F3C6C7', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
            No profile data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
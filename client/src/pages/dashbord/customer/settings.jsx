import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { customerAPI } from '../../../api';
import {
  Lock, Check, AlertCircle, Eye, EyeOff, Loader2, ArrowLeft, Sun, Moon, Monitor,
  User, MapPin, Bell, ShieldCheck, Trash2, Plus, Pencil, X, Star,
  Mail, Phone as PhoneIcon, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';

// ---------------------------------------------------------------------------
// Small reusable bits
// ---------------------------------------------------------------------------

const ToggleSwitch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50
      ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${checked ? 'translate-x-4' : 'translate-x-1'}`}
    />
  </button>
);

const SectionCard = ({ icon: Icon, title, description, children, dense }) => (
  <Card className="overflow-hidden border-slate-200/70 shadow-sm rounded-xl">
    <CardHeader className={`border-b border-slate-100 dark:border-slate-800/60 ${dense ? 'py-3.5 px-4' : 'py-4 px-5'}`}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold leading-none">{title}</CardTitle>
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{description}</p>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className={dense ? 'pt-4 px-4 pb-4' : 'pt-4 px-5 pb-5'}>{children}</CardContent>
  </Card>
);

const NAV_ITEMS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const EMPTY_ADDRESS = {
  label: 'Home',
  fullName: '',
  phone: '',
  city: '',
  subcity: '',
  woreda: '',
  street: '',
  isDefault: false,
};

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const ThemeToggle = () => {
    const renderThemeIcon = () => {
      if (theme === 'system') return <Monitor className="w-4 h-4" />;
      return isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-colors" aria-label="Toggle Theme">
            {renderThemeIcon()}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-[var(--border)] bg-[var(--card)] shadow-lg">
          <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
            <Moon className="mr-2 h-4 w-4 text-amber-500" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer text-[var(--foreground)] hover:bg-[var(--secondary)]">
            <Monitor className="mr-2 h-4 w-4 text-amber-500" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // ---- Profile / account ---------------------------------------------------
  const [profileData, setProfileData] = useState({ email: '', phone: '', name: '', profileImage: '', bio: '', address: '', location: '' });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [emailError, setEmailError] = useState('');

  const [phoneForm, setPhoneForm] = useState({ newPhone: '' });
  const [phoneError, setPhoneError] = useState('');

  // ---- Account deletion --------------------------------------------------------------
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ---- Privacy --------------------------------------------------------------
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public', // 'public' | 'private'
    showEmailOnProfile: false,
    showPhoneOnProfile: false,
    showOrderActivity: true,
  });
  const [privacySaving, setPrivacySaving] = useState(false);

  // ---- Addresses --------------------------------------------------------------
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);

  // ---- Notifications --------------------------------------------------------------
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    vendorMessages: true,
    priceDrops: false,
  });

  const [accountSettings, setAccountSettings] = useState({ language: 'English', timezone: 'Africa/Addis_Ababa', twoFactor: false, loginAlerts: true, sessionTimeout: 30 });
  const [profileImageUrl, setProfileImageUrl] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      setSettingsLoading(true);
      try {
        const response = await customerAPI.getSettings();
        const settings = response.data || {};
        setProfileData({
          email: settings.email || user.email || '',
          phone: settings.phone || user.phone || '',
          name: settings.name || user.name || '',
          profileImage: settings.profileImage || user.profileImage || '',
          bio: settings.bio || '',
          address: settings.address || '',
          location: settings.location || '',
        });
        setEmailForm({ newEmail: settings.email || user.email || '' });
        setPhoneForm({ newPhone: settings.phone || user.phone || '' });
        setProfileImageUrl(settings.profileImage || user.profileImage || '');
        setAccountSettings({
          language: settings.language || 'English',
          timezone: settings.timezone || 'Africa/Addis_Ababa',
          twoFactor: !!settings.twoFactor,
          loginAlerts: settings.loginAlerts !== false,
          sessionTimeout: settings.sessionTimeout || 30,
        });
        setPrivacy({
          profileVisibility: settings.profileVisibility || 'public',
          showEmailOnProfile: !!settings.showEmailOnProfile,
          showPhoneOnProfile: !!settings.showPhoneOnProfile,
          showAddressOnProfile: !!settings.showAddressOnProfile,
          showOrderActivity: settings.showOrderActivity !== false,
        });
        setNotifications((prev) => ({
          ...prev,
          orderUpdates: settings.emailNotifications !== false,
          promotions: settings.emailNotifications !== false,
          vendorMessages: settings.pushNotifications !== false,
          priceDrops: settings.smsNotifications === true,
        }));
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to load settings.');
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const loadAddresses = async () => {
      setAddressesLoading(true);
      try {
        const response = await customerAPI.getAddresses();
        if (isMounted) setAddresses(response.data?.addresses || response.data || []);
      } catch (err) {
        if (isMounted) setAddresses([]);
      } finally {
        if (isMounted) setAddressesLoading(false);
      }
    };

    loadAddresses();
    return () => { isMounted = false; };
  }, []);

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    window.setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess('');
    window.setTimeout(() => setError(''), 3000);
  };

  // ---- Validators --------------------------------------------------------------
  const validatePasswordChange = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(passwordForm.newPassword)) errors.newPassword = 'Password needs an uppercase letter';
    if (!/[a-z]/.test(passwordForm.newPassword)) errors.newPassword = 'Password needs a lowercase letter';
    if (!/[0-9]/.test(passwordForm.newPassword)) errors.newPassword = 'Password needs a number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword)) errors.newPassword = 'Password needs a special character';
    if (!passwordForm.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEthiopianPhone = (phone) => {
    const patterns = [/^09\d{8}$/, /^07\d{8}$/, /^\+2519\d{8}$/, /^\+2517\d{8}$/];
    return patterns.some((pattern) => pattern.test(phone));
  };

  const validateAddress = (form) => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!validateEthiopianPhone(form.phone)) return 'Use a valid Ethiopian phone number format';
    if (!form.city.trim()) return 'City is required';
    if (!form.subcity.trim()) return 'Sub-city is required';
    if (!form.street.trim()) return 'Street / house number is required';
    return '';
  };

  // ---- Account handlers --------------------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerAPI.updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        address: profileData.address,
        location: profileData.location,
      });
      showSuccess('Profile updated successfully.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setProfileImageUrl(imageUrl);
    setLoading(true);
    try {
      const response = await customerAPI.uploadProfileImage(imageUrl);
      setProfileImageUrl(response.data?.profileImage || imageUrl);
      setProfileData((prev) => ({ ...prev, profileImage: response.data?.profileImage || imageUrl }));
      showSuccess('Profile picture updated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;
    setLoading(true);
    try {
      await customerAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showSuccess('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.newEmail) return setEmailError('Email address is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) return setEmailError('Enter a valid email address');

    setLoading(true);
    try {
      const response = await customerAPI.updateProfile({ email: emailForm.newEmail });
      const nextEmail = response.data?.email || emailForm.newEmail;
      setProfileData((prev) => ({ ...prev, email: nextEmail }));
      setEmailForm({ newEmail: nextEmail });
      showSuccess('Email address updated successfully.');
      setEmailError('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (e) => {
    e.preventDefault();
    if (!phoneForm.newPhone) return setPhoneError('Phone number is required');
    if (!validateEthiopianPhone(phoneForm.newPhone)) return setPhoneError('Use a valid Ethiopian phone number format.');

    setLoading(true);
    try {
      const response = await customerAPI.updatePhone({ phone: phoneForm.newPhone });
      const nextPhone = response.data?.phone || phoneForm.newPhone;
      setProfileData((prev) => ({ ...prev, phone: nextPhone }));
      setPhoneForm({ newPhone: nextPhone });
      showSuccess('Phone number updated successfully.');
      setPhoneError('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE in the box to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await customerAPI.deleteAccount();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  // ---- Privacy handlers --------------------------------------------------------------
  const persistPrivacy = async (next) => {
    setPrivacySaving(true);
    try {
      await customerAPI.updateSettings({
        profileVisibility: next.profileVisibility,
        privateAccount: next.profileVisibility === 'private',
        showEmailOnProfile: next.showEmailOnProfile,
        showPhoneOnProfile: next.showPhoneOnProfile,
        showAddressOnProfile: next.showAddressOnProfile,
        showOrderActivity: next.showOrderActivity,
      });
      showSuccess('Privacy settings saved.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save privacy settings.');
    } finally {
      setPrivacySaving(false);
    }
  };

  const setVisibility = (value) => {
    const next = { ...privacy, profileVisibility: value };
    setPrivacy(next);
    persistPrivacy(next);
  };

  const togglePrivacyFlag = (key) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    persistPrivacy(next);
  };

  // ---- Address handlers --------------------------------------------------------------
  const openNewAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setAddressError('');
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address) => {
    setAddressForm({ ...EMPTY_ADDRESS, ...address });
    setEditingAddressId(address.id || address._id);
    setAddressError('');
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setAddressForm(EMPTY_ADDRESS);
    setEditingAddressId(null);
    setAddressError('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const validationMessage = validateAddress(addressForm);
    if (validationMessage) {
      setAddressError(validationMessage);
      return;
    }

    setAddressSaving(true);
    try {
      if (editingAddressId) {
        const response = await customerAPI.updateAddress(editingAddressId, addressForm);
        const updated = response.data?.address || { ...addressForm, id: editingAddressId };
        setAddresses((prev) => prev.map((a) => (a.id === editingAddressId || a._id === editingAddressId ? updated : a)));
        showSuccess('Address updated successfully.');
      } else {
        const response = await customerAPI.addAddress(addressForm);
        const created = response.data?.address || { ...addressForm, id: Date.now().toString() };
        setAddresses((prev) => [...prev, created]);
        showSuccess('Address added successfully.');
      }
      closeAddressForm();
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (address) => {
    const id = address.id || address._id;
    try {
      await customerAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => (a.id || a._id) !== id));
      showSuccess('Address removed.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to remove address.');
    }
  };

  const handleSetDefaultAddress = async (address) => {
    const id = address.id || address._id;
    try {
      await customerAPI.updateAddress(id, { ...address, isDefault: true });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: (a.id || a._id) === id })));
      showSuccess('Default address updated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to set default address.');
    }
  };

  // ---- Notification handlers --------------------------------------------------------------
  const toggleNotification = async (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    try {
      await customerAPI.updateSettings({
        emailNotifications: next.orderUpdates || next.promotions,
        pushNotifications: next.vendorMessages || next.orderUpdates,
        smsNotifications: next.priceDrops,
      });
    } catch (err) {
      showError('Failed to save notification preference.');
      setNotifications(notifications);
    }
  };

  const saveAccountPreferences = async (nextValues) => {
    setLoading(true);
    try {
      await customerAPI.updateSettings(nextValues);
      setAccountSettings((prev) => ({ ...prev, ...nextValues }));
      showSuccess('Account preferences updated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save account preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      await customerAPI.deactivateAccount();
      showSuccess('Account deactivated.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to deactivate account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setLoading(true);
    try {
      await customerAPI.updateSettings({ loginAlerts: true });
      showSuccess('Signed out from other sessions.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to sign out from other sessions.');
    } finally {
      setLoading(false);
    }
  };

  const pageContainerClass = theme === 'dark'
    ? 'min-h-screen bg-slate-950 text-white'
    : 'min-h-screen bg-slate-50 text-slate-900';

  const visibilityLabels = {
    public: { title: 'Public', hint: 'Visible to shoppers & vendors' },
    private: { title: 'Private', hint: 'Hidden from other users' },
  };

  return (
    <div className={pageContainerClass}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile summary — compact */}
        <div className="flex items-center gap-3.5 mb-6 rounded-xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.name || 'User Name'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
          </div>
          <Button onClick={() => navigate('/customer/profile')} variant="outline" size="sm" className="shrink-0 text-xs h-8">
            View profile
          </Button>
        </div>

        {/* Success / Error toasts */}
        {success && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-[176px_1fr]">
          {/* Sidebar nav */}
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${activeTab === id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800/60'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-4 min-w-0">
            {activeTab === 'account' && (
              <>
                <SectionCard icon={Mail} title="Email" description="Order receipts & recovery" dense>
                  <form onSubmit={handleChangeEmail} className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {profileData.email || user?.email || 'Not provided'}
                    </div>
                    <div>
                      <Label htmlFor="newEmail" className="text-xs">New email</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) => { setEmailForm({ newEmail: e.target.value }); if (emailError) setEmailError(''); }}
                        placeholder="name@example.com"
                        className={`mt-1 h-9 ${emailError ? 'border-red-300' : ''}`}
                      />
                      {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                    </div>
                    <Button type="submit" disabled={loading} size="sm">
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Update email
                    </Button>
                  </form>
                </SectionCard>

                <SectionCard icon={PhoneIcon} title="Phone" description="Delivery & order updates" dense>
                  <form onSubmit={handleChangePhone} className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {profileData.phone || user?.phone || 'Not provided'}
                    </div>
                    <div>
                      <Label htmlFor="newPhone" className="text-xs">New phone</Label>
                      <Input
                        id="newPhone"
                        type="tel"
                        value={phoneForm.newPhone}
                        onChange={(e) => { setPhoneForm({ newPhone: e.target.value }); if (phoneError) setPhoneError(''); }}
                        placeholder="09XXXXXXXX"
                        className={`mt-1 h-9 ${phoneError ? 'border-red-300' : ''}`}
                      />
                      {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                    </div>
                    <p className="text-xs text-slate-400">Accepted: 09XXXXXXXX, 07XXXXXXXX, +2519XXXXXXXX, +2517XXXXXXXX</p>
                    <Button type="submit" disabled={loading} size="sm">
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Update phone
                    </Button>
                  </form>
                </SectionCard>

                <SectionCard icon={Lock} title="Password" description="Use a strong, unique password" dense>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    {[
                      { key: 'current', field: 'currentPassword', label: 'Current password', placeholder: 'Current password' },
                      { key: 'new', field: 'newPassword', label: 'New password', placeholder: 'New password' },
                      { key: 'confirm', field: 'confirmPassword', label: 'Confirm new password', placeholder: 'Re-enter new password' },
                    ].map(({ key, field, label, placeholder }) => (
                      <div key={field}>
                        <Label htmlFor={field} className="text-xs">{label}</Label>
                        <div className="relative mt-1">
                          <Input
                            id={field}
                            type={showPassword[key] ? 'text' : 'password'}
                            value={passwordForm[field]}
                            onChange={(e) => {
                              setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
                              if (passwordErrors[field]) setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
                            }}
                            placeholder={placeholder}
                            className={`h-9 pr-9 ${passwordErrors[field] ? 'border-red-300' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }))}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword[key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {passwordErrors[field] && <p className="mt-1 text-xs text-red-500">{passwordErrors[field]}</p>}
                      </div>
                    ))}
                    <Button type="submit" disabled={loading} size="sm">
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Lock className="h-3.5 w-3.5 mr-1.5" />}
                      Update password
                    </Button>
                  </form>
                </SectionCard>

                <SectionCard icon={Trash2} title="Delete account" description="Permanent — cannot be undone" dense>
                  {!showDeleteConfirm ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        This removes your order history, saved addresses, and wishlists for good.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete account
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3.5 space-y-3">
                      <p className="text-xs text-red-700">
                        This action is permanent. Type <span className="font-semibold">DELETE</span> to confirm.
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => { setDeleteConfirmText(e.target.value); if (deleteError) setDeleteError(''); }}
                        placeholder="Type DELETE"
                        className="h-9 bg-white"
                      />
                      {deleteError && <p className="text-xs text-red-600">{deleteError}</p>}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-100"
                          disabled={deleting}
                          onClick={handleDeleteAccount}
                        >
                          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                          Confirm delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </>
            )}

            {activeTab === 'privacy' && (
              <>
                <SectionCard icon={ShieldCheck} title="Profile visibility" description="Who can see your storefront profile" dense>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-300 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${privacy.profileVisibility === 'public' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className="font-medium text-slate-800">{visibilityLabels[privacy.profileVisibility].title}</span>
                          <span className="text-xs text-slate-400">— {visibilityLabels[privacy.profileVisibility].hint}</span>
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72 bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem onClick={() => setVisibility('public')} className="cursor-pointer flex-col items-start gap-0.5 py-2">
                        <span className="text-sm font-medium text-slate-900">Public</span>
                        <span className="text-xs text-slate-500">Visible to other shoppers & vendors</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibility('private')} className="cursor-pointer flex-col items-start gap-0.5 py-2">
                        <span className="text-sm font-medium text-slate-900">Private</span>
                        <span className="text-xs text-slate-500">Hidden from other users</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {privacySaving && <p className="mt-2 text-xs text-slate-400">Saving…</p>}
                </SectionCard>

                <SectionCard icon={Eye} title="What others can see" description="Applies even in public mode" dense>
                  <div className="divide-y divide-slate-100">
                    {[
                      { key: 'showEmailOnProfile', label: 'Show email on profile', hint: 'Vendors can contact you by email.' },
                      { key: 'showPhoneOnProfile', label: 'Show phone on profile', hint: 'Vendors can contact you by phone.' },
                      { key: 'showOrderActivity', label: 'Show review & order activity', hint: 'Reviews are shown with your name.' },
                    ].map(({ key, label, hint }) => (
                      <div key={key} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="pr-3">
                          <p className="text-sm font-medium text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
                        </div>
                        <ToggleSwitch checked={privacy[key]} onChange={() => togglePrivacyFlag(key)} label={label} />
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {activeTab === 'addresses' && (
              <SectionCard icon={MapPin} title="Delivery addresses" description="Where vendors ship your orders" dense>
                <div className="space-y-2.5">
                  {addressesLoading && (
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading addresses…</p>
                  )}

                  {!addressesLoading && addresses.length === 0 && !showAddressForm && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
                      <MapPin className="h-5 w-5 mx-auto text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">No saved addresses yet.</p>
                    </div>
                  )}

                  {addresses.map((address) => {
                    const id = address.id || address._id;
                    return (
                      <div key={id} className="rounded-lg border border-slate-200 p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 text-sm">{address.label || 'Address'}</p>
                              {address.isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                                  <Star className="h-2.5 w-2.5 fill-indigo-600 text-indigo-600" /> Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{address.fullName} · {address.phone}</p>
                            <p className="text-xs text-slate-500">{[address.street, address.woreda, address.subcity, address.city].filter(Boolean).join(', ')}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEditAddressForm(address)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100" aria-label="Edit address">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteAddress(address)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50" aria-label="Delete address">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {!address.isDefault && (
                          <button onClick={() => handleSetDefaultAddress(address)} className="mt-2.5 text-xs font-medium text-indigo-600 hover:underline">
                            Set as default
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {showAddressForm && (
                    <form onSubmit={handleSaveAddress} className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 text-sm">{editingAddressId ? 'Edit address' : 'New address'}</p>
                        <button type="button" onClick={closeAddressForm} className="p-1 rounded-md text-slate-400 hover:bg-white">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="addrLabel" className="text-xs">Label</Label>
                          <Input id="addrLabel" value={addressForm.label}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                            placeholder="Home, Office…" className="h-9 mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="addrFullName" className="text-xs">Full name</Label>
                          <Input id="addrFullName" value={addressForm.fullName}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Recipient's full name" className="h-9 mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="addrPhone" className="text-xs">Phone</Label>
                          <Input id="addrPhone" value={addressForm.phone}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="09XXXXXXXX" className="h-9 mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="addrCity" className="text-xs">City</Label>
                          <Input id="addrCity" value={addressForm.city}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                            placeholder="Addis Ababa" className="h-9 mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="addrSubcity" className="text-xs">Sub-city</Label>
                          <Input id="addrSubcity" value={addressForm.subcity}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, subcity: e.target.value }))}
                            placeholder="Bole" className="h-9 mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="addrWoreda" className="text-xs">Woreda</Label>
                          <Input id="addrWoreda" value={addressForm.woreda}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, woreda: e.target.value }))}
                            placeholder="03" className="h-9 mt-1" />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="addrStreet" className="text-xs">Street / house number</Label>
                          <Input id="addrStreet" value={addressForm.street}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))}
                            placeholder="House no., street name, landmark" className="h-9 mt-1" />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                          className="rounded border-slate-300" />
                        Set as default delivery address
                      </label>

                      {addressError && <p className="text-xs text-red-500">{addressError}</p>}

                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={addressSaving}>
                          {addressSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                          {editingAddressId ? 'Save changes' : 'Add address'}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={closeAddressForm}>Cancel</Button>
                      </div>
                    </form>
                  )}


                </div>
              </SectionCard>
            )}

            {activeTab === 'notifications' && (
              <SectionCard icon={Bell} title="Notifications" description="What you'll be notified about" dense>
                <div className="divide-y divide-slate-100">
                  {[
                    { key: 'orderUpdates', label: 'Order updates', hint: 'Shipping, delivery, and status changes.' },
                    { key: 'vendorMessages', label: 'Vendor messages', hint: 'Direct messages from sellers.' },
                    { key: 'priceDrops', label: 'Price drops', hint: 'Alerts for wishlist items on sale.' },
                    { key: 'promotions', label: 'Promotions & offers', hint: 'Marketplace-wide deals and codes.' },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="pr-3">
                        <p className="text-sm font-medium text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
                      </div>
                      <ToggleSwitch checked={notifications[key]} onChange={() => toggleNotification(key)} label={label} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { useFarmerProfile } from '../../../../context/FarmerProfileContext';
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit2,
  X,
  Badge as BadgeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/api';
import { toast } from 'sonner';

const Settings = () => {
  const { profile: contextProfile, fetchProfile, updateProfile, updateSettings } = useFarmerProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    farmName: '',
    location: '',
    farmSize: '',
    bio: '',
    joinedDate: '',
    certifications: [],
    languages: [],
    language: 'English',
    timezone: 'Africa/Addis_Ababa',
    emailOrders: true,
    emailMessages: true,
    emailPromotions: false,
    pushOrders: true,
    pushMessages: true,
    pushPromotions: false,
    smsOrders: false,
    smsAlerts: true,
    bankName: '',
    accountNumber: '',
    paymentMethod: 'Bank Transfer',
    autoWithdrawal: false,
    withdrawalThreshold: '1000',
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: '30',
    lastPasswordChange: '',
    businessLicense: '',
    taxId: '',
    vatRegistered: false,
    vatNumber: '',
    insuranceProvider: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    farmRegistration: ''
  });

  useEffect(() => {
    // Fetch settings on mount if not already loaded
    if (!contextProfile) {
      fetchProfileSettings();
    }
  }, [contextProfile]);

  useEffect(() => {
    // Sync settings with context profile
    if (contextProfile) {
      setSettings(prev => ({ ...prev, ...contextProfile }));
    }
  }, [contextProfile]);

  const fetchProfileSettings = async () => {
    try {
      const res = await api.get('/farmer/settings');
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('Failed to load settings');
    }
  };

  const handleSaveAccount = async () => {
    setLoading(true);
    try {
      await updateSettings({
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        location: settings.location,
        farmName: settings.farmName,
        farmSize: settings.farmSize,
        bio: settings.bio,
        language: settings.language,
        timezone: settings.timezone
      });
      toast.success('Account settings saved successfully');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    setLoading(true);
    try {
      await api.put('/farmer/settings/password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await updateSettings({
        emailOrders: settings.emailOrders,
        emailMessages: settings.emailMessages,
        emailPromotions: settings.emailPromotions,
        pushOrders: settings.pushOrders,
        pushMessages: settings.pushMessages,
        pushPromotions: settings.pushPromotions,
        smsOrders: settings.smsOrders,
        smsAlerts: settings.smsAlerts
      });
      toast.success('Notification preferences saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      await updateSettings({
        bankName: settings.bankName,
        accountNumber: settings.accountNumber,
        paymentMethod: settings.paymentMethod,
        autoWithdrawal: settings.autoWithdrawal,
        withdrawalThreshold: settings.withdrawalThreshold
      });
      toast.success('Payment settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await updateSettings({
        twoFactor: settings.twoFactor,
        loginAlerts: settings.loginAlerts,
        sessionTimeout: settings.sessionTimeout
      });
      toast.success('Security settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfessional = async () => {
    setLoading(true);
    try {
      await updateSettings({
        businessLicense: settings.businessLicense,
        taxId: settings.taxId,
        vatRegistered: settings.vatRegistered,
        vatNumber: settings.vatNumber,
        insuranceProvider: settings.insuranceProvider,
        insurancePolicy: settings.insurancePolicy,
        insuranceExpiry: settings.insuranceExpiry,
        farmRegistration: settings.farmRegistration
      });
      toast.success('Professional settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save professional settings');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'professional', label: 'Professional', icon: Globe },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <h1 className="text-sm font-semibold text-slate-900">Settings</h1>
        <p className="text-[10px] text-slate-500">Manage your account and professional settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
        {/* Sidebar Tabs */}
        <div className="lg:w-44 space-y-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-xl lg:max-w-xl bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Profile Information</h2>
                <div className="flex items-center gap-2">
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} className="bg-slate-900 hover:bg-slate-800 h-7 text-xs rounded-lg transition-all">
                      <Edit2 className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="border-slate-200 h-7 text-xs rounded-lg">
                        <X className="h-3 w-3 mr-1.5" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAccount} disabled={loading} className="bg-slate-900 hover:bg-slate-800 h-7 text-xs rounded-lg transition-all">
                        <Save className="h-3 w-3 mr-1.5" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-semibold">
                      {settings.name?.charAt(0) || 'F'}
                    </div>
                    {!isEditingProfile && (
                      <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800">
                        <Camera className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none text-[10px]">Verified Farmer</Badge>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-700">Full Name</Label>
                      {isEditingProfile ? (
                        <Input
                          value={settings.name}
                          onChange={(e) => setSettings({...settings, name: e.target.value})}
                          className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-900 mt-1">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {settings.name || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-slate-700">Email</Label>
                      {isEditingProfile ? (
                        <Input
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                          className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-900 mt-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {settings.email || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-slate-700">Phone</Label>
                      {isEditingProfile ? (
                        <Input
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-900 mt-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {settings.phone || 'Not set'}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-slate-700">Location</Label>
                      {isEditingProfile ? (
                        <Input
                          value={settings.location}
                          onChange={(e) => setSettings({...settings, location: e.target.value})}
                          className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-900 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {settings.location || 'Not set'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-slate-700">Farm Name</Label>
                    {isEditingProfile ? (
                      <Input
                        value={settings.farmName}
                        onChange={(e) => setSettings({...settings, farmName: e.target.value})}
                        className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-slate-900 mt-1">{settings.farmName || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-slate-700">Farm Size</Label>
                    {isEditingProfile ? (
                      <Input
                        value={settings.farmSize}
                        onChange={(e) => setSettings({...settings, farmSize: e.target.value})}
                        className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                      />
                    ) : (
                      <div className="text-sm text-slate-900 mt-1">{settings.farmSize || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-slate-700">Bio</Label>
                    {isEditingProfile ? (
                      <Textarea
                        value={settings.bio}
                        onChange={(e) => setSettings({...settings, bio: e.target.value})}
                        className="border-slate-200 text-sm mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 mt-1">{settings.bio || 'No bio added'}</p>
                    )}
                  </div>

                  {settings.joinedDate && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Member since {settings.joinedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Account Settings</h2>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-700">Email Address</Label>
                  <Input 
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Phone Number</Label>
                  <Input 
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Language</Label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-xs h-8"
                  >
                    <option>English</option>
                    <option>Amharic</option>
                    <option>Oromo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Timezone</Label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-xs h-8"
                  >
                    <option>Africa/Addis_Ababa</option>
                    <option>Africa/Nairobi</option>
                    <option>Africa/Cairo</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleSaveAccount}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs rounded-lg transition-all"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
              
              <div className="space-y-3">
                <div className="relative">
                  <Label className="text-xs text-slate-700">Current Password</Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="border-slate-200 pr-8 h-8 text-sm rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                  {newPassword && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getStrengthColor(getPasswordStrength(newPassword))}`}
                            style={{ width: `${(getPasswordStrength(newPassword) / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getStrengthColor(getPasswordStrength(newPassword)).replace('bg-', 'text-')}`}>
                          {getStrengthText(getPasswordStrength(newPassword))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Confirm New Password</Label>
                  <Input type="password" className="border-slate-200 h-8 text-sm mt-1" />
                </div>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-1.5 text-xs">Password Requirements:</h3>
                <ul className="text-xs space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={newPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-slate-600'}>At least 8 characters long</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[a-z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one number</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one special character</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleSavePassword}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Notification Preferences</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">New Orders</span>
                      <Switch 
                        checked={settings.emailOrders}
                        onCheckedChange={(checked) => setSettings({...settings, emailOrders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Messages</span>
                      <Switch 
                        checked={settings.emailMessages}
                        onCheckedChange={(checked) => setSettings({...settings, emailMessages: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Promotions & Updates</span>
                      <Switch 
                        checked={settings.emailPromotions}
                        onCheckedChange={(checked) => setSettings({...settings, emailPromotions: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    Push Notifications
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">New Orders</span>
                      <Switch 
                        checked={settings.pushOrders}
                        onCheckedChange={(checked) => setSettings({...settings, pushOrders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Messages</span>
                      <Switch 
                        checked={settings.pushMessages}
                        onCheckedChange={(checked) => setSettings({...settings, pushMessages: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Promotions & Updates</span>
                      <Switch 
                        checked={settings.pushPromotions}
                        onCheckedChange={(checked) => setSettings({...settings, pushPromotions: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Order Alerts</span>
                      <Switch 
                        checked={settings.smsOrders}
                        onCheckedChange={(checked) => setSettings({...settings, smsOrders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Critical Alerts</span>
                      <Switch 
                        checked={settings.smsAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, smsAlerts: checked})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveNotifications}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Payment Settings</h2>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-700">Bank Name</Label>
                  <select 
                    value={settings.bankName}
                    onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                    className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-xs h-8"
                  >
                    <option value="">Select Bank</option>
                    <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Bank of Abyssinia">Bank of Abyssinia (BoA)</option>
                    <option value="Dashen Bank">Dashen Bank</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Wegagen Bank">Wegagen Bank</option>
                    <option value="Nib International Bank">Nib International Bank (NIB)</option>
                    <option value="United Bank">United Bank</option>
                    <option value="Bunna International Bank">Bunna International Bank</option>
                    <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia</option>
                    <option value="Oromia International Bank">Oromia International Bank</option>
                    <option value="Development Bank of Ethiopia">Development Bank of Ethiopia (DBE)</option>
                    <option value="Ethiopian Investment Bank">Ethiopian Investment Bank</option>
                    <option value="Berhan International Bank">Berhan International Bank</option>
                    <option value="Hijra Bank">Hijra Bank</option>
                    <option value="Zamzam Bank">Zamzam Bank</option>
                    <option value="Safa Bank">Safa Bank</option>
                    <option value="Ahadu Bank">Ahadu Bank</option>
                    <option value="Goh Betoch Bank">Goh Betoch Bank</option>
                    <option value="Amhara Bank">Amhara Bank</option>
                    <option value="Sidama Bank">Sidama Bank</option>
                    <option value="Omo Bank">Omo Bank</option>
                    <option value="Tsehay Bank">Tsehay Bank</option>
                    <option value="Ethio Lease">Ethio Lease</option>
                    <option value="Ethio Insurance">Ethio Insurance</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Account Number</Label>
                  <Input 
                    value={settings.accountNumber}
                    onChange={(e) => setSettings({...settings, accountNumber: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Preferred Payment Method</Label>
                  <select 
                    value={settings.paymentMethod}
                    onChange={(e) => setSettings({...settings, paymentMethod: e.target.value})}
                    className="w-full mt-1 px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-xs h-8"
                  >
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                    <option>Check</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label className="text-xs text-slate-700">Auto Withdrawal</Label>
                    <p className="text-xs text-slate-500">Automatically withdraw earnings when threshold is reached</p>
                  </div>
                  <Switch 
                    checked={settings.autoWithdrawal}
                    onCheckedChange={(checked) => setSettings({...settings, autoWithdrawal: checked})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Withdrawal Threshold (ETB)</Label>
                  <Input 
                    value={settings.withdrawalThreshold}
                    onChange={(e) => setSettings({...settings, withdrawalThreshold: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSavePayment}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Security Settings</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => setSettings({...settings, twoFactor: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs">Login Alerts</h3>
                    <p className="text-xs text-slate-500">Get notified when someone logs into your account</p>
                  </div>
                  <Switch 
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, loginAlerts: checked})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Session Timeout (minutes)</Label>
                  <Input 
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <strong>Last Password Change:</strong> {settings.lastPasswordChange || 'Never'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSaveSecurity}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Professional Settings</h2>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-700">Business License Number</Label>
                  <Input 
                    value={settings.businessLicense}
                    onChange={(e) => setSettings({...settings, businessLicense: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Tax ID (TIN)</Label>
                  <Input 
                    value={settings.taxId}
                    onChange={(e) => setSettings({...settings, taxId: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-slate-700">VAT Registered</Label>
                    <p className="text-xs text-slate-500">Enable if your business is VAT registered</p>
                  </div>
                  <Switch 
                    checked={settings.vatRegistered}
                    onCheckedChange={(checked) => setSettings({...settings, vatRegistered: checked})}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">VAT Number</Label>
                  <Input 
                    value={settings.vatNumber}
                    onChange={(e) => setSettings({...settings, vatNumber: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Insurance Provider</Label>
                  <Input 
                    value={settings.insuranceProvider}
                    onChange={(e) => setSettings({...settings, insuranceProvider: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Insurance Policy Number</Label>
                  <Input 
                    value={settings.insurancePolicy}
                    onChange={(e) => setSettings({...settings, insurancePolicy: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Insurance Expiry Date</Label>
                  <Input 
                    type="date"
                    value={settings.insuranceExpiry}
                    onChange={(e) => setSettings({...settings, insuranceExpiry: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Farm Registration Number</Label>
                  <Input 
                    value={settings.farmRegistration}
                    onChange={(e) => setSettings({...settings, farmRegistration: e.target.value})}
                    className="border-slate-200 h-8 text-sm mt-1"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveProfessional}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 h-8 text-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {loading ? 'Saving...' : 'Save Professional Settings'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

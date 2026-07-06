import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import api from '../../../api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    language: 'English',
    timezone: 'Africa/Addis_Ababa',
    emailAlerts: true,
    emailMessages: true,
    emailReports: true,
    pushAlerts: true,
    pushMessages: true,
    pushReports: false,
    smsAlerts: true,
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: '15',
    lastPasswordChange: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSaveAccount = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/settings', {
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        language: settings.language,
        timezone: settings.timezone
      });
      setSuccess('Account settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('Please fill in all password fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/settings/password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/settings', {
        emailAlerts: settings.emailAlerts,
        emailMessages: settings.emailMessages,
        emailReports: settings.emailReports,
        pushAlerts: settings.pushAlerts,
        pushMessages: settings.pushMessages,
        pushReports: settings.pushReports,
        smsAlerts: settings.smsAlerts
      });
      setSuccess('Notification preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/admin/settings', {
        twoFactor: settings.twoFactor,
        loginAlerts: settings.loginAlerts,
        sessionTimeout: settings.sessionTimeout
      });
      setSuccess('Security settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save security settings');
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
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-5xl mx-auto">
        <h1 className="text-sm font-semibold text-slate-900">Settings</h1>
        <p className="text-[10px] text-slate-500">Manage your admin preferences and security</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Sidebar Tabs */}
        <div className="lg:w-48 space-y-1 shrink-0">
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
        <div className="flex-1 max-w-2xl lg:max-w-2xl bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
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
                      <span className="text-xs text-slate-700">System Alerts</span>
                      <Switch 
                        checked={settings.emailAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, emailAlerts: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">User Messages</span>
                      <Switch 
                        checked={settings.emailMessages}
                        onCheckedChange={(checked) => setSettings({...settings, emailMessages: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Weekly Reports</span>
                      <Switch 
                        checked={settings.emailReports}
                        onCheckedChange={(checked) => setSettings({...settings, emailReports: checked})}
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
                      <span className="text-xs text-slate-700">System Alerts</span>
                      <Switch 
                        checked={settings.pushAlerts}
                        onCheckedChange={(checked) => setSettings({...settings, pushAlerts: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">User Messages</span>
                      <Switch 
                        checked={settings.pushMessages}
                        onCheckedChange={(checked) => setSettings({...settings, pushMessages: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700">Weekly Reports</span>
                      <Switch 
                        checked={settings.pushReports}
                        onCheckedChange={(checked) => setSettings({...settings, pushReports: checked})}
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
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

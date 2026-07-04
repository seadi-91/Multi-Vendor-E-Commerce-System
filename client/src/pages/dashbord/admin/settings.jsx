import React, { useState } from 'react';
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

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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

  const settings = {
    account: {
      email: 'admin@farmconnect.com',
      phone: '+251 911 000 000',
      language: 'English',
      timezone: 'Africa/Addis_Ababa',
    },
    notifications: {
      emailAlerts: true,
      emailMessages: true,
      emailReports: true,
      pushAlerts: true,
      pushMessages: true,
      pushReports: false,
      smsAlerts: true,
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '15',
      lastPasswordChange: 'March 15, 2024',
    }
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
        <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500">Manage your admin preferences and security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
          {activeTab === 'account' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-700">Email Address</Label>
                  <Input 
                    defaultValue={settings.account.email} 
                    className="border-slate-200 h-9 text-sm mt-1 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Phone Number</Label>
                  <Input 
                    defaultValue={settings.account.phone} 
                    className="border-slate-200 h-9 text-sm mt-1 rounded-md"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Language</Label>
                  <select 
                    defaultValue={settings.account.language}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm h-9"
                  >
                    <option>English</option>
                    <option>Amharic</option>
                    <option>Oromo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Timezone</Label>
                  <select 
                    defaultValue={settings.account.timezone}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm h-9"
                  >
                    <option>Africa/Addis_Ababa</option>
                    <option>Africa/Nairobi</option>
                    <option>Africa/Cairo</option>
                  </select>
                </div>
              </div>

              <Button className="bg-slate-900 hover:bg-slate-800 h-9 text-sm rounded-lg transition-all">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <Label className="text-xs text-slate-700">Current Password</Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      className="border-slate-200 pr-10 h-9 text-sm rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-slate-200 h-9 text-sm mt-1"
                  />
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
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
                  <Input type="password" className="border-slate-200 h-9 text-sm mt-1" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">Password Requirements:</h3>
                <ul className="text-xs space-y-2">
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={newPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-slate-600'}>At least 8 characters long</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[a-z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-600'}>Contains at least one special character</span>
                  </li>
                </ul>
              </div>

              <Button className="bg-slate-900 hover:bg-slate-800 h-9 text-sm">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">System Alerts</span>
                      <Switch checked={settings.notifications.emailAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">User Messages</span>
                      <Switch checked={settings.notifications.emailMessages} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Weekly Reports</span>
                      <Switch checked={settings.notifications.emailReports} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">System Alerts</span>
                      <Switch checked={settings.notifications.pushAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">User Messages</span>
                      <Switch checked={settings.notifications.pushMessages} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Weekly Reports</span>
                      <Switch checked={settings.notifications.pushReports} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Critical Alerts</span>
                      <Switch checked={settings.notifications.smsAlerts} />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="bg-slate-900 hover:bg-slate-800 h-9 text-sm">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch checked={settings.security.twoFactor} />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Login Alerts</h3>
                    <p className="text-xs text-slate-500">Get notified when someone logs into your account</p>
                  </div>
                  <Switch checked={settings.security.loginAlerts} />
                </div>
                <div>
                  <Label className="text-xs text-slate-700">Session Timeout (minutes)</Label>
                  <Input 
                    defaultValue={settings.security.sessionTimeout} 
                    className="border-slate-200 h-9 text-sm mt-1"
                  />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <strong>Last Password Change:</strong> {settings.security.lastPasswordChange}
                  </p>
                </div>
              </div>

              <Button className="bg-slate-900 hover:bg-slate-800 h-9 text-sm">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

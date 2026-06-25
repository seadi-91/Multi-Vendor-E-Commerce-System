import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
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
      email: 'mubarek.edris@farmconnect.com',
      phone: '+251 911 234 567',
      language: 'English',
      timezone: 'Africa/Addis_Ababa',
    },
    notifications: {
      emailOrders: true,
      emailMessages: true,
      emailPromotions: false,
      pushOrders: true,
      pushMessages: true,
      pushPromotions: false,
      smsOrders: false,
      smsAlerts: true,
    },
    payment: {
      bankName: 'Commercial Bank of Ethiopia',
      accountNumber: '1234567890',
      paymentMethod: 'Bank Transfer',
      autoWithdraw: false,
      withdrawalThreshold: '1000',
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '30',
      lastPasswordChange: 'March 15, 2024',
    },
    professional: {
      businessLicense: 'ETH-FARM-2024-001234',
      taxId: 'TIN-123456789',
      vatRegistered: true,
      vatNumber: 'VAT-987654321',
      insuranceProvider: 'Ethiopian Insurance Corporation',
      insurancePolicy: 'FARM-INS-2024-5678',
      insuranceExpiry: 'December 31, 2024',
      certifications: ['Organic Certified', 'Fair Trade', 'ISO 22000'],
      farmRegistration: 'Gondar Agricultural Zone - Reg #4567',
      membershipAssociations: ['Ethiopian Farmers Association', 'Organic Agriculture Network'],
    },
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'professional', label: 'Professional', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-forest-900">Settings</h1>
        <p className="text-forest-600">Manage your account and professional settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'text-forest-700 hover:bg-forest-50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white border border-forest-100 rounded-2xl p-6 shadow-sm">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-forest-700">Email Address</Label>
                  <Input 
                    defaultValue={settings.account.email} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Phone Number</Label>
                  <Input 
                    defaultValue={settings.account.phone} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Language</Label>
                  <select 
                    defaultValue={settings.account.language}
                    className="w-full mt-1 px-3 py-2 border border-forest-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option>English</option>
                    <option>Amharic</option>
                    <option>Oromo</option>
                  </select>
                </div>
                <div>
                  <Label className="text-forest-700">Timezone</Label>
                  <select 
                    defaultValue={settings.account.timezone}
                    className="w-full mt-1 px-3 py-2 border border-forest-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option>Africa/Addis_Ababa</option>
                    <option>Africa/Nairobi</option>
                    <option>Africa/Cairo</option>
                  </select>
                </div>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Change Password</h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <Label className="text-forest-700">Current Password</Label>
                  <div className="relative mt-1">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      className="border-forest-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-forest-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-forest-200 mt-1"
                  />
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-forest-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getStrengthColor(getPasswordStrength(newPassword))}`}
                            style={{ width: `${(getPasswordStrength(newPassword) / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getStrengthColor(getPasswordStrength(newPassword)).replace('bg-', 'text-')}`}>
                          {getStrengthText(getPasswordStrength(newPassword))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-forest-700">Confirm New Password</Label>
                  <Input type="password" className="border-forest-200 mt-1" />
                </div>
              </div>

              <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl">
                <h3 className="font-semibold text-forest-900 mb-3">Password Requirements:</h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-forest-300'}`} />
                    <span className={newPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-forest-600'}>At least 8 characters long</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-forest-300'}`} />
                    <span className={/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-forest-600'}>Contains at least one uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-forest-300'}`} />
                    <span className={/[a-z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-forest-600'}>Contains at least one lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-forest-300'}`} />
                    <span className={/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-forest-600'}>Contains at least one number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-forest-300'}`} />
                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-forest-600'}>Contains at least one special character</span>
                  </li>
                </ul>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-forest-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">New Orders</span>
                      <Switch checked={settings.notifications.emailOrders} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Messages</span>
                      <Switch checked={settings.notifications.emailMessages} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Promotions & Updates</span>
                      <Switch checked={settings.notifications.emailPromotions} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-forest-900 mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">New Orders</span>
                      <Switch checked={settings.notifications.pushOrders} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Messages</span>
                      <Switch checked={settings.notifications.pushMessages} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Promotions & Updates</span>
                      <Switch checked={settings.notifications.pushPromotions} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-forest-900 mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    SMS Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Order Alerts</span>
                      <Switch checked={settings.notifications.smsOrders} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700">Critical Alerts</span>
                      <Switch checked={settings.notifications.smsAlerts} />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Payment Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-forest-700">Bank Name</Label>
                  <select 
                    defaultValue={settings.payment.bankName}
                    className="w-full mt-1 px-3 py-2 border border-forest-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
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
                  <Label className="text-forest-700">Account Number</Label>
                  <Input 
                    defaultValue={settings.payment.accountNumber} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Preferred Payment Method</Label>
                  <select 
                    defaultValue={settings.payment.paymentMethod}
                    className="w-full mt-1 px-3 py-2 border border-forest-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                    <option>Check</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <Label className="text-forest-700">Auto Withdrawal</Label>
                    <p className="text-sm text-forest-600">Automatically withdraw earnings when threshold is reached</p>
                  </div>
                  <Switch checked={settings.payment.autoWithdraw} />
                </div>
                <div>
                  <Label className="text-forest-700">Withdrawal Threshold (ETB)</Label>
                  <Input 
                    defaultValue={settings.payment.withdrawalThreshold} 
                    className="border-forest-200 mt-1"
                  />
                </div>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-forest-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-forest-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-forest-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch checked={settings.security.twoFactor} />
                </div>
                <div className="flex items-center justify-between p-4 bg-forest-50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-forest-900">Login Alerts</h3>
                    <p className="text-sm text-forest-600">Get notified when someone logs into your account</p>
                  </div>
                  <Switch checked={settings.security.loginAlerts} />
                </div>
                <div>
                  <Label className="text-forest-700">Session Timeout (minutes)</Label>
                  <Input 
                    defaultValue={settings.security.sessionTimeout} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <strong>Last Password Change:</strong> {settings.security.lastPasswordChange}
                  </p>
                </div>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-forest-900">Professional Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-forest-700">Business License Number</Label>
                  <Input 
                    defaultValue={settings.professional.businessLicense} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Tax ID (TIN)</Label>
                  <Input 
                    defaultValue={settings.professional.taxId} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-forest-700">VAT Registered</Label>
                    <p className="text-sm text-forest-600">Enable if your business is VAT registered</p>
                  </div>
                  <Switch checked={settings.professional.vatRegistered} />
                </div>
                <div>
                  <Label className="text-forest-700">VAT Number</Label>
                  <Input 
                    defaultValue={settings.professional.vatNumber} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Insurance Provider</Label>
                  <Input 
                    defaultValue={settings.professional.insuranceProvider} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Insurance Policy Number</Label>
                  <Input 
                    defaultValue={settings.professional.insurancePolicy} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Insurance Expiry Date</Label>
                  <Input 
                    type="date"
                    defaultValue={settings.professional.insuranceExpiry}
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Farm Registration Number</Label>
                  <Input 
                    defaultValue={settings.professional.farmRegistration} 
                    className="border-forest-200 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-forest-700">Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.professional.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-forest-100 text-forest-700 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-forest-700">Membership Associations</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.professional.membershipAssociations.map((assoc, index) => (
                      <span key={index} className="px-3 py-1 bg-mint-100 text-mint-700 rounded-full text-sm">
                        {assoc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="bg-forest-600 hover:bg-forest-700">
                <Save className="h-4 w-4 mr-2" />
                Save Professional Settings
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

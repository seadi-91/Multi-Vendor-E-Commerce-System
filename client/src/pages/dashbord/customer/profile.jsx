import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { customerAPI } from '../../../api.js';
import { 
  User, Mail, Phone, Lock, Shield, Check, X, 
  Eye, EyeOff, AlertCircle, Save, RefreshCw, MapPin
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    subcity: '',
    fullAddress: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch customer data from customer table
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getProfile();
      const data = response.data;
      setCustomerData({
        id: data.id || data.customerId || '',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        subcity: data.subcity || data.address || '',
        fullAddress: data.fullAddress || data.additionalInfo || ''
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Fallback to auth user data
      if (user) {
        setCustomerData({
          id: user.id || '',
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          subcity: user.address || '',
          fullAddress: user.fullAddress || user.additionalInfo || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCustomerData();
    }
  }, [user]);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false

  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Phone change state
  const [phoneData, setPhoneData] = useState({
    newPhone: customerData.phone || user?.phone || ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Address change state
  const [addressData, setAddressData] = useState({
    city: customerData.city || user?.city || '',
    subcity: customerData.subcity || user?.address || '',
    fullAddress: customerData.fullAddress || user?.fullAddress || user?.additionalInfo || ''
  });
  const [addressSuccess, setAddressSuccess] = useState(false);

  // Password validation rules
  const validatePassword = (password) => {
    const errors = {};
    
    if (!password) {
      errors.required = 'Password is required';
    } else {
      if (password.length < 6) {
        errors.length = 'Password must be at least 6 characters';
      }
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = 'Must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(password)) {
        errors.lowercase = 'Must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(password)) {
        errors.number = 'Must contain at least one number';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.special = 'Must contain at least one special character';
      }
    }
    
    return errors;
  };

  // Ethiopian phone validation
  const validateEthiopianPhone = (phone) => {
    const patterns = [
      /^09\d{8}$/,           // Starts with 09, 8 digits
      /^07\d{8}$/,           // Starts with 07, 8 digits
      /^\+2519\d{8}$/,       // Starts with +2519, 8 digits
      /^\+2517\d{8}$/        // Starts with +2517, 8 digits
    ];
    
    return patterns.some(pattern => pattern.test(phone));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear success message when typing
    if (passwordSuccess) setPasswordSuccess(false);
    
    // Validate new password in real-time
    if (name === 'newPassword') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
    
    // Validate password match
    if (name === 'confirmPassword' || (name === 'newPassword' && passwordData.confirmPassword)) {
      if (value && passwordData.newPassword && value !== passwordData.newPassword) {
        setPasswordErrors(prev => ({ ...prev, match: 'Passwords do not match' }));
      } else {
        setPasswordErrors(prev => {
          const { match, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneData({ newPhone: value });
    setPhoneSuccess(false);
    
    if (value && !validateEthiopianPhone(value)) {
      setPhoneError('Invalid Ethiopian phone number. Must start with 09/07/+2519/+2517 followed by 8 digits');
    } else {
      setPhoneError('');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = validatePassword(passwordData.newPassword);
    
    if (!passwordData.currentPassword) {
      errors.current = 'Current password is required';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.match = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Verify current password before allowing change
      // In production, this would be an API call to verify the password
      // For now, we'll simulate the verification
      verifyCurrentPassword(passwordData.currentPassword)
        .then(isValid => {
          if (isValid) {
            // Password verified, proceed with change
            setPasswordSuccess(true);
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            
            // Reset success after 3 seconds
            setTimeout(() => setPasswordSuccess(false), 3000);
          } else {
            // Current password is incorrect
            setPasswordErrors({ current: 'Current password is incorrect' });
          }
        })
        .catch(err => {
          setPasswordErrors({ current: 'Failed to verify password. Please try again.' });
        });
    }
  };

  // Function to verify current password (simulated - replace with actual API call)
  const verifyCurrentPassword = async (currentPassword) => {
    // In production, this would be:
    // const response = await fetch('/api/auth/verify-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ currentPassword })
    // });
    // const data = await response.json();
    // return data.valid;
    
    // For simulation, we'll return true (in production, this would verify against the backend)
    // You can add actual verification logic here once the backend API is ready
    return true;
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    
    if (!phoneData.newPhone) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (!validateEthiopianPhone(phoneData.newPhone)) {
      setPhoneError('Invalid Ethiopian phone number');
      return;
    }
    
    // Simulate API call
    setPhoneSuccess(true);
    
    // Reset success after 3 seconds
    setTimeout(() => setPhoneSuccess(false), 3000);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
    setAddressSuccess(false);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    
    // Simulate API call
    setAddressSuccess(true);
    
    // Reset success after 3 seconds
    setTimeout(() => setAddressSuccess(false), 3000);
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6" />
          My Profile
        </h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and security settings</p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
          <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-600 rounded-full">
            <Check className="w-3 h-3 inline mr-1" />
            Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Customer ID</p>
              <p className="text-sm font-bold text-gray-900 truncate">{customerData.id || user?.id || 'FC-2024-001234'}</p>
            </div>
          </div>

          {/* Name */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Full Name</p>
              <p className="text-sm font-bold text-gray-900 truncate">{customerData.name || user?.name || 'Selam Tesfaye'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Email Address</p>
              <p className="text-sm font-bold text-gray-900 truncate">{customerData.email || user?.email || 'selam@example.com'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Phone Number</p>
              <p className="text-sm font-bold text-gray-900 truncate">{customerData.phone || user?.phone || '+251911234567'}</p>
            </div>
          </div>

          {/* Address - spans both columns on mobile/tablet */}
          <div className="md:col-span-2 flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium mb-1">Full Address</p>
              <p className="text-sm font-bold text-gray-900">
                { (addressData.subcity || addressData.city || addressData.fullAddress) 
                  ? `${addressData.subcity ? addressData.subcity + ', ' : ''}${addressData.city ? addressData.city + ' - ' : ''}${addressData.fullAddress}`
                  : 'No address added yet'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change Password Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500">Update your security credentials</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Password changed successfully!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                    passwordErrors.current ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordErrors.current}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                    Object.keys(passwordErrors).some(key => key !== 'current' && key !== 'match') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 bg-gray-50 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < getPasswordStrength(passwordData.newPassword) 
                            ? strengthColors[getPasswordStrength(passwordData.newPassword) - 1] 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className={`font-semibold ${
                      getPasswordStrength(passwordData.newPassword) >= 4 ? 'text-green-600' : 
                      getPasswordStrength(passwordData.newPassword) >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {strengthLabels[getPasswordStrength(passwordData.newPassword) - 1] || 'Very Weak'}
                    </span>
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500 font-medium">Password must contain:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`text-xs flex items-center gap-1 ${
                    passwordData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {passwordData.newPassword.length >= 6 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    At least 6 characters
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    /[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[A-Z]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    One uppercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    /[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[a-z]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    One lowercase letter
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    /[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[0-9]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    One number
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    One special character
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                    passwordErrors.match ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.match && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {passwordErrors.match}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Change Password
            </button>
          </form>
        </div>

        {/* Change Phone Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Change Phone Number</h3>
              <p className="text-xs text-gray-500">Update your contact information</p>
            </div>
          </div>

          {phoneSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Phone number updated successfully!</span>
            </div>
          )}

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {/* Current Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Phone Number</label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{customerData.phone || user?.phone || '+251911234567'}</span>
              </div>
            </div>

            {/* New Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Phone Number</label>
              <input
                type="tel"
                name="newPhone"
                value={phoneData.newPhone}
                onChange={handlePhoneChange}
                placeholder="09XXXXXXXX or +2519XXXXXXXX"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
                  phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-green-500'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {phoneError}
                </p>
              )}
            </div>

            {/* Phone Format Info */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-2">Ethiopian Phone Format:</p>
              <div className="space-y-1">
                <div className="text-xs text-blue-600 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  <span>09XXXXXXXX (10 digits starting with 09)</span>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  <span>07XXXXXXXX (10 digits starting with 07)</span>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  <span>+2519XXXXXXXX (12 digits starting with +2519)</span>
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  <span>+2517XXXXXXXX (12 digits starting with +2517)</span>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            {phoneData.newPhone && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                validateEthiopianPhone(phoneData.newPhone) 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {validateEthiopianPhone(phoneData.newPhone) ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Valid phone number format</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">Invalid phone number format</span>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!!phoneError || !phoneData.newPhone}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update Phone Number
            </button>
          </form>
        </div>

        {/* Update Address Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Update Address</h3>
              <p className="text-xs text-gray-500">Update your delivery information</p>
            </div>
          </div>

          {addressSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Address updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleAddressSubmit} className="space-y-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
              <select
                name="city"
                value={addressData.city}
                onChange={handleAddressChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-gray-50 focus:border-green-500"
              >
                <option value="">Select City</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Adama">Adama</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Hawassa">Hawassa</option>
              </select>
            </div>

            {/* Subcity */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subcity/Area</label>
              <input
                type="text"
                name="subcity"
                value={addressData.subcity}
                onChange={handleAddressChange}
                placeholder="e.g., Bole, Kirkos, Arada"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-gray-50 focus:border-green-500"
              />
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Address</label>
              <textarea
                name="fullAddress"
                value={addressData.fullAddress}
                onChange={handleAddressChange}
                placeholder="House number, street, landmark, etc."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-gray-50 focus:border-green-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

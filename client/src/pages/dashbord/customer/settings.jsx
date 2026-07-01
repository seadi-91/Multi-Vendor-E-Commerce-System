import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../api';
import { 
  User, Lock, MapPin, 
  ChevronRight, Camera, Edit2, Trash2, 
  Check, X, Plus, AlertCircle, Save, XCircle, Eye, EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [profileData, setProfileData] = useState({
    profilePhoto: '',
    fullName: '',
    email: '',
    phone: '',
    customerId: ''
  });

  const [addressData, setAddressData] = useState({
    homeAddress: { city: '', subcity: '', fullAddress: '' },
    otherAddresses: []
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ city: '', subcity: '', fullAddress: '' });
  
  // Security form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [phoneForm, setPhoneForm] = useState({
    newPhone: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [phoneError, setPhoneError] = useState('');

  React.useEffect(() => {
    if (user) {
      setProfileData({
        profilePhoto: user.profileImage || '',
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        customerId: user.id || 'FC-2024-001234'
      });
    }
  }, [user]);

  const showSuccess = (message) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 3000);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData(prev => ({ ...prev, profilePhoto: event.target.result }));
        showSuccess('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Profile saved successfully!');
    } catch (err) {
      showError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Security handlers
  const validatePasswordChange = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;
    
    setLoading(true);
    try {
      await authAPI.updateUser(user.id, {
        password: passwordForm.newPassword,
        oldPassword: passwordForm.currentPassword
      });
      showSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const validateEthiopianPhone = (phone) => {
    const patterns = [
      /^09\d{8}$/,
      /^07\d{8}$/,
      /^\+2519\d{8}$/,
      /^\+2517\d{8}$/
    ];
    return patterns.some(pattern => pattern.test(phone));
  };

  const handleChangePhone = async (e) => {
    e.preventDefault();
    if (!phoneForm.newPhone) {
      setPhoneError('Phone number is required');
      return;
    }
    if (!validateEthiopianPhone(phoneForm.newPhone)) {
      setPhoneError('Invalid Ethiopian phone number format');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.updateUser(user.id, { phone: phoneForm.newPhone });
      showSuccess('Phone number updated successfully!');
      setShowPhoneModal(false);
      setPhoneForm({ newPhone: '' });
      // Update local user data
      setProfileData(prev => ({ ...prev, phone: phoneForm.newPhone }));
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };




  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Account deletion request submitted');
      setShowDeleteModal(false);
    } catch (err) {
      showError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ city: '', subcity: '', fullAddress: '' });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (index, isHome = false) => {
    if (isHome) {
      setEditingAddress({ type: 'home' });
      setAddressForm(addressData.homeAddress);
    } else {
      setEditingAddress({ type: 'other', index });
      setAddressForm(addressData.otherAddresses[index]);
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (editingAddress) {
      if (editingAddress.type === 'home') {
        setAddressData(prev => ({ ...prev, homeAddress: addressForm }));
      } else {
        const updated = [...addressData.otherAddresses];
        updated[editingAddress.index] = addressForm;
        setAddressData(prev => ({ ...prev, otherAddresses: updated }));
      }
      showSuccess('Address updated successfully!');
    } else {
      setAddressData(prev => ({
        ...prev,
        otherAddresses: [...prev.otherAddresses, addressForm]
      }));
      showSuccess('Address added successfully!');
    }
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (index) => {
    const updated = addressData.otherAddresses.filter((_, i) => i !== index);
    setAddressData(prev => ({ ...prev, otherAddresses: updated }));
    showSuccess('Address deleted successfully!');
  };

  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'address', label: 'Address Book', icon: MapPin }
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
            {profileData.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-emerald-600" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer ID */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-xs font-medium text-gray-500 mb-1">Customer ID</label>
          <p className="text-sm font-semibold text-gray-900">{profileData.customerId || 'Not set'}</p>
        </div>

        {/* Full Name */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
          <p className="text-sm font-semibold text-gray-900">{profileData.fullName || 'Not set'}</p>
        </div>
        
        {/* Email Address */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
          <p className="text-sm font-semibold text-gray-900">{profileData.email || 'Not set'}</p>
        </div>
        
        {/* Phone Number */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
          <p className="text-sm font-semibold text-gray-900">{profileData.phone || 'Not set'}</p>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Login & Security</h2>
      
      <div className="space-y-4">
        <div 
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Update your password regularly</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div 
          onClick={() => setShowPhoneModal(true)}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">Change Phone Number</h3>
              <p className="text-sm text-gray-500">Update your contact number</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        <div 
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">Permanently delete your account</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400" />
        </div>
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-xl'
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordModal = () => (
    <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showPassword.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.currentPassword && (
            <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPassword.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.newPassword && (
            <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordErrors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPasswordModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderPhoneModal = () => (
    <Modal isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)} title="Change Phone Number">
      <form onSubmit={handleChangePhone} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Phone</label>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600">{user?.phone || '+251911234567'}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Phone Number</label>
          <input
            type="tel"
            placeholder="09XXXXXXXX or +2519XXXXXXXX"
            value={phoneForm.newPhone}
            onChange={(e) => {
              setPhoneForm(prev => ({ ...prev, newPhone: e.target.value }));
              if (phoneError) setPhoneError('');
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
          />
          {phoneError && (
            <p className="text-sm text-red-500 mt-1">{phoneError}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Valid formats: 09XXXXXXXX, 07XXXXXXXX, +2519XXXXXXXX, +2517XXXXXXXX
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPhoneModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Phone'}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderDeleteModal = () => (
    <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mb-2" />
          <p className="text-red-800">
            Warning: This action is irreversible. All your data will be permanently deleted.
          </p>
        </div>
        
        <p className="text-gray-600">
          Are you sure you want to delete your account? This will remove all your orders, profile information, and cannot be undone.
        </p>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </Modal>
  );

  const renderAddressSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
        <button
          onClick={handleOpenAddAddress}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Home Address */}
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Home Address
            </h3>
            <button 
              onClick={() => handleOpenEditAddress(null, true)}
              className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          {(addressData.homeAddress.city || addressData.homeAddress.subcity || addressData.homeAddress.fullAddress) ? (
            <div className="space-y-1 text-sm text-gray-700">
              {addressData.homeAddress.subcity && <p>{addressData.homeAddress.subcity}</p>}
              {addressData.homeAddress.city && <p>{addressData.homeAddress.city}</p>}
              {addressData.homeAddress.fullAddress && <p>{addressData.homeAddress.fullAddress}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No home address set</p>
          )}
        </div>

        {/* Other Addresses */}
        {addressData.otherAddresses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Other Addresses</h3>
            {addressData.otherAddresses.map((addr, index) => (
              <div key={index} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    Address {index + 1}
                  </h4>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditAddress(index, false)}
                      className="text-gray-500 hover:text-emerald-600 p-1 hover:bg-emerald-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(index)}
                      className="text-gray-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  {addr.subcity && <p>{addr.subcity}</p>}
                  {addr.city && <p>{addr.city}</p>}
                  {addr.fullAddress && <p>{addr.fullAddress}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAddressModal = () => (
    <Modal 
      isOpen={showAddressModal} 
      onClose={() => setShowAddressModal(false)} 
      title={editingAddress ? 'Edit Address' : 'Add New Address'}
    >
      <form onSubmit={handleSaveAddress} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={addressForm.city}
            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select City</option>
            <option value="Addis Ababa">Addis Ababa</option>
            <option value="Adama">Adama</option>
            <option value="Bahir Dar">Bahir Dar</option>
            <option value="Mekelle">Mekelle</option>
            <option value="Hawassa">Hawassa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcity/Area</label>
          <input
            type="text"
            placeholder="e.g., Bole, Kirkos, Arada"
            value={addressForm.subcity}
            onChange={(e) => setAddressForm(prev => ({ ...prev, subcity: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
          <textarea
            placeholder="House number, street, landmark, etc."
            value={addressForm.fullAddress}
            onChange={(e) => setAddressForm(prev => ({ ...prev, fullAddress: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddressModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            {editingAddress ? 'Update Address' : 'Add Address'}
          </button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="p-8">
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Settings</h2>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-green-50 text-green-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'security' && renderSecuritySection()}
          {activeSection === 'address' && renderAddressSection()}
        </div>
      </div>

      {/* Security Modals */}
      {renderPasswordModal()}
      {renderPhoneModal()}
      {renderDeleteModal()}
      {/* Address Modal */}
      {renderAddressModal()}
    </div>
  );
};

export default Settings;

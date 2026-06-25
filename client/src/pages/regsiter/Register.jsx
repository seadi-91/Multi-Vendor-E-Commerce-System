import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/roles';

const Register = () => {
  const navigate = useNavigate();
  const { loading, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.CUSTOMER,
    phone: '',
    address: '',
    profileImage: null,
    nationalId: null,
    tinNumber: '',
    landMapFile: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Farmer-specific validation
    if (formData.role === ROLES.FARMER) {
      if (!formData.address) {
        toast.error('Address is required for farmers');
        return;
      }
      // Skip file validation for now - file upload not implemented yet
    }

    try {
      // Only send text fields, skip file objects for now
      const { confirmPassword, profileImage, nationalId, landMapFile, ...registrationData } = formData;
      await register(registrationData);
      toast.success('Registration successful! Welcome to FarmConnect!');

      setTimeout(() => {
        if (registrationData.role === ROLES.FARMER) {
          navigate('/farmer/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }, 800);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Branding */}
          <div className="lg:w-2/5 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2 animate-float"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full transform -translate-x-1/3 translate-y-1/3 animate-float animation-delay-3000"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8 animate-fade-in-down">
                  <div className="text-5xl drop-shadow-lg">🌱</div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">FarmConnect</h2>
                    <p className="text-emerald-100 text-sm font-medium">Direct Farm to Table</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-2xl font-bold mb-4 leading-tight">Join Our Sustainable Community</h3>
                    <p className="text-emerald-100 leading-relaxed text-sm">
                      Connect directly with local farmers and customers. Build sustainable relationships that benefit everyone in the food ecosystem.
                    </p>
                  </div>

                  <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 group cursor-default">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="font-medium">Fresh, local produce</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-default">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="font-medium">Direct farmer connections</span>
                    </div>
                    <div className="flex items-center gap-3 group cursor-default">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span className="font-medium">Sustainable farming</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-xs text-emerald-200">
                  🌍 Join 10,000+ farmers and customers
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-3/5 p-8 lg:p-12 bg-white/50 backdrop-blur-sm">
            <div className="max-w-lg mx-auto">
              <div className="mb-8 animate-fade-in-down">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Create Account</h1>
                <p className="text-gray-600">Get started with your FarmConnect journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Role Selection */}
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">I want to</h3>
                    <p className="text-sm text-gray-600 mb-4">Choose your account type</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        value: ROLES.CUSTOMER,
                        label: 'Buy Products',
                        icon: '🛒',
                        description: 'Purchase fresh produce from local farmers'
                      },
                      {
                        value: ROLES.FARMER,
                        label: 'Sell Products',
                        icon: '👨‍🌾',
                        description: 'Sell your farm products directly to customers'
                      }
                    ].map((roleOption) => {
                      const isSelected = formData.role === roleOption.value;
                      return (
                        <div
                          key={roleOption.value}
                          className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isSelected
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 ring-4 ring-emerald-200 shadow-lg'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'
                            }`}
                          onClick={() => setFormData(prev => ({ ...prev, role: roleOption.value }))}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3 transform transition-transform duration-300">{roleOption.icon}</div>
                            <h4 className="font-semibold text-gray-900 mb-2">{roleOption.label}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{roleOption.description}</p>
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md animate-bounce">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                          )}

                          <input
                            type="radio"
                            name="role"
                            value={roleOption.value}
                            checked={isSelected}
                            onChange={handleChange}
                            className="sr-only"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Information */}
                {formData.role && (
                  <>
                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-gradient-to-r from-emerald-500 to-teal-500 pb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="John Doe"
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 group">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="john@example.com"
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 group">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              placeholder="+1 (555) 123-4567"
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Farmer-specific fields */}
                    {formData.role === ROLES.FARMER && (
                      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-gradient-to-r from-emerald-500 to-teal-500 pb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          Farm Information
                        </h3>

                        <div className="space-y-2 group">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Farm Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <textarea
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows="4"
                              placeholder="Enter your complete farm address..."
                              required
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none group-hover:shadow-md"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2 group">
                            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                              Profile Image <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              id="profileImage"
                              name="profileImage"
                              onChange={handleFileChange}
                              accept="image/*"
                              required
                              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-emerald-50 file:to-teal-50 file:text-emerald-700 hover:file:from-emerald-100 hover:file:to-teal-100 group-hover:shadow-md"
                            />
                          </div>

                          <div className="space-y-2 group">
                            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                              National ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="file"
                              id="nationalId"
                              name="nationalId"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                              required
                              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-emerald-50 file:to-teal-50 file:text-emerald-700 hover:file:from-emerald-100 hover:file:to-teal-100 group-hover:shadow-md"
                            />
                          </div>

                          <div className="space-y-2 group">
                            <label htmlFor="tinNumber" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                              TIN Number
                            </label>
                            <input
                              type="text"
                              id="tinNumber"
                              name="tinNumber"
                              value={formData.tinNumber}
                              onChange={handleChange}
                              placeholder="Enter TIN number"
                              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                          </div>

                          <div className="space-y-2 group">
                            <label htmlFor="landMapFile" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                              Land Map File
                            </label>
                            <input
                              type="file"
                              id="landMapFile"
                              name="landMapFile"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                              className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gradient-to-r file:from-emerald-50 file:to-teal-50 file:text-emerald-700 hover:file:from-emerald-100 hover:file:to-teal-100 group-hover:shadow-md"
                            />
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-sm text-amber-800">
                              <strong>Note:</strong> Either TIN number or Land Map file is required for farmer verification.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Password Section */}
                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-gradient-to-r from-emerald-500 to-teal-500 pb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Security
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              placeholder="Create a strong password"
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors duration-200"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <svg className={`h-5 w-5 text-gray-400 ${showPassword ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <svg className={`h-5 w-5 text-emerald-600 ${showPassword ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                        </div>

                        <div className="space-y-2 group">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              required
                              placeholder="Confirm your password"
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 group-hover:shadow-md"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors duration-200"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              <svg className={`h-5 w-5 text-gray-400 ${showConfirmPassword ? 'hidden' : 'block'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <svg className={`h-5 w-5 text-emerald-600 ${showConfirmPassword ? 'block' : 'hidden'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Submit */}
                    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                      <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            required
                            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 transition-all duration-200"
                          />
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                          I agree to the{' '}
                          <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 flex items-center justify-center gap-3 relative overflow-hidden group"
                        disabled={loading}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="relative z-10">Create Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors duration-200 relative inline-block group"
                  >
                    Sign In
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
                  <span>🌱</span>
                  <span>By joining, you agree to our community guidelines and sustainable farming practices</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
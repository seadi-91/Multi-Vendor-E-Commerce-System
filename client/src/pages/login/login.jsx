import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES_BY_ROLE, ROLES } from '../../context/roles';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login(formData.email, formData.password);

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      toast.dismiss();
      toast.success(`Welcome back, ${result.user.name || result.user.role}!`);
      setFormData(prev => ({ ...prev, password: '' }));
      
      // Normalize role to lowercase for route lookup
      const userRole = result.user.role?.toLowerCase();
      const redirectPath = ROUTES_BY_ROLE[userRole] || '/';
      console.log('Login redirect:', { userRole, redirectPath });
      setTimeout(() => navigate(redirectPath), 800);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Invalid email or password');
      setFormData(prev => ({ ...prev, password: '' }));
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

      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 text-gray-700 hover:text-emerald-600 group transform hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-semibold">Back</span>
      </Link>

      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-12 text-white relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-1/2 -translate-y-1/2 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full transform -translate-x-1/3 translate-y-1/3 animate-float animation-delay-3000"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-8 animate-fade-in-down">
                <div className="text-6xl drop-shadow-lg">🌱</div>
                <div>
                  <h2 className="text-4xl font-bold tracking-tight">FarmConnect</h2>
                  <p className="text-emerald-100 text-lg font-medium">Direct Farm to Table</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-3xl font-bold mb-4 leading-tight">Welcome Back!</h3>
                  <p className="text-emerald-100 leading-relaxed text-lg">
                    Continue your journey in connecting with local farmers and fresh produce. Your community is waiting for you.
                  </p>
                </div>

                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Access your dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Manage your orders</span>
                  </div>
                  <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 transform group-hover:scale-110">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Connect with community</span>
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

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 p-8 lg:p-12 bg-white/50 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8 animate-fade-in-down">
              <div className="text-4xl">🌱</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FarmConnect</h1>
                <p className="text-gray-600">Direct Farm to Table</p>
              </div>
            </div>

            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue to your farm community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-md"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold hover:underline transition-colors duration-200"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-emerald-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
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
                {formData.password && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${formData.password.length < 6
                          ? 'w-1/3 bg-red-500'
                          : formData.password.length < 8
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-green-500'
                          }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${formData.password.length < 6
                      ? 'text-red-500'
                      : formData.password.length < 8
                        ? 'text-yellow-500'
                        : 'text-green-500'
                      }`}>
                      {formData.password.length < 6 ? 'Weak' : formData.password.length < 8 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <label className="flex items-center cursor-pointer group p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 disabled:opacity-50 transition-all duration-200"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:translate-y-0 flex items-center justify-center gap-3 relative overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: '0.5s' }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="relative z-10">Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <p className="text-gray-600">
                New to FarmConnect?{' '}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors duration-200 relative inline-block group"
                >
                  Create an account
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-2">
                <span>🌱</span>
                <span>Join our community of farmers and customers</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
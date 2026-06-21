import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES_BY_ROLE, ROLES } from '../../context/roles';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '', // Always start empty
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
      // Reset password field after successful login
      setFormData(prev => ({ ...prev, password: '' }));
      // Redirect based on role
      const redirectPath = ROUTES_BY_ROLE[result.user.role] || '/';
      setTimeout(() => navigate(redirectPath), 800);
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Invalid email or password');
      // Reset password field after failed login
      setFormData(prev => ({ ...prev, password: '' }));
    }
  };

  // Quick login demo accounts
  const handleDemoLogin = (role) => {
    const demoAccounts = {
      [ROLES.CUSTOMER]: {
        email: 'customer@demo.com',
        password: 'demo123'
      }
    };

    const account = demoAccounts[role];
    setFormData({
      email: account ? account.email : '',
      password: account ? account.password : '',
      rememberMe: false
    });
    // Auto submit after a short delay if demo account exists
    if (account) {
      setTimeout(() => {
        document.querySelector('.btn-login').click();
      }, 300);
    }
  };

  return (
    <div className="login-container">
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/" className="back-button">
          <span className="back-icon">←</span>
          Back to Home
        </Link>
      </div>

      <div className="login-card">
        {/* Decorative background elements */}
        <div className="decoration-bg">
          <div className="bg-circle"></div>
          <div className="bg-circle"></div>
        </div>

        <div className="login-header">
          <div className="logo-section">
            <span className="logo-icon">🌱</span>
            <h1>FarmConnect</h1>
          </div>
          <h2>Welcome Back</h2>
          <p className="welcome-text">Sign in to continue to your farm community</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                disabled={loading}
                className="form-input"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={loading}
                className="form-input"
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="show-password"
                onClick={(e) => {
                  const input = e.target.closest('.input-with-icon').querySelector('input');
                  input.type = input.type === 'password' ? 'text' : 'password';
                  e.target.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
                }}
              >
                👁️
              </button>
            </div>
            <div className="password-strength">
              <div className={`strength-bar ${formData.password.length > 0 ? 'active' : ''}`}></div>
            </div>
          </div>

          {/* Options */}
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Remember me for 30 days</span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-login"
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="register-footer">
          <p className="footer-text">
            New to FarmConnect?{' '}
            <Link to="/register" className="register-link">
              Create an account
            </Link>
          </p>
          <p className="footer-note">
            Join our community of farmers and customers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/roles';
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();
  const { loading, register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.CUSTOMER,
    farmName: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
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
    <div className="register-container">
      <div className="register-card">
        {/* Decorative elements */}
        <div className="card-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>

        <div className="register-header">
          <div className="logo-container">
            <span className="logo-icon">🌱</span>
            <h2>FarmConnect</h2>
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Join our sustainable farming community</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Role Selection Section */}
          <div className="form-section">
            <h3 className="section-title">Account Type</h3>
            <p className="section-subtitle">Choose how you want to use FarmConnect</p>
            
            <div className="role-selection">
              {[
                { 
                  value: ROLES.CUSTOMER, 
                  label: 'Customer', 
                  icon: '🛒',
                  description: 'Buy fresh produce from local farmers'
                },
                { 
                  value: ROLES.FARMER, 
                  label: 'Farmer', 
                  icon: '👨‍🌾',
                  description: 'Sell your farm products directly'
                }
              ].map((roleOption) => {
                const isSelected = formData.role === roleOption.value;
                return (
                  <div
                    key={roleOption.value}
                    className={`role-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, role: roleOption.value }))}
                  >
                    <div className="role-card-header">
                      <span className="role-icon">{roleOption.icon}</span>
                      <div className="role-title">
                        <h4>{roleOption.label}</h4>
                        <p className="role-description">{roleOption.description}</p>
                      </div>
                      {isSelected && (
                        <div className="selection-indicator">
                          <div className="checkmark"></div>
                        </div>
                      )}
                    </div>
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

            {/* Farmer-specific fields */}
            {formData.role === ROLES.FARMER && (
              <div className="farmer-fields">
                <div className="form-group">
                  <label htmlFor="address">
                    Farm Address <span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter your farm location and address details"
                    required
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="form-section">
            <h3 className="section-title">Security</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 6 characters"
                  className="input-field"
                />
                <div className="password-hint">Minimum 6 characters with letters and numbers</div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter your password"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Terms & Submit */}
          <div className="form-section">
            <div className="terms-agreement">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  required
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="terms-text">
                  I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-register"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </p>
          <p className="footer-note">
            By joining, you agree to our community guidelines
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
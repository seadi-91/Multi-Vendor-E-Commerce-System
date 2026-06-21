import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CustomerHeader from '../dashbord/customer/header/Header';
import { FiShoppingBag, FiHome, FiMapPin, FiPhone, FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import { MdDeliveryDining, MdPayment } from 'react-icons/md';
import './Checkout.scss';

const Checkout = () => {
  const { cart, cartCount, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    additionalInfo: '',
    paymentMethod: 'cash',
    saveInfo: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.15;
  const total = subtotal + deliveryFee + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderData = {
        ...formData,
        items: cart,
        total,
        orderId: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        status: 'Success',
      };

      // Save order to localStorage for Orders page (append to array)
      const prevOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([orderData, ...prevOrders]));
      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      console.log('Order submitted:', orderData);
      
      // Show success state
      setOrderPlaced(true);
      
      // Clear cart after delay
      setTimeout(() => {
        clearCart();
        navigate('/customer/orders', { state: { orderSuccess: true } });
      }, 3000);
      
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Order submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-empty-state">
        <div className="empty-state-content">
          <FiShoppingBag className="empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to proceed to checkout</p>
          <button 
            className="primary-btn"
            onClick={() => navigate('/customer/dashboard')}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} cartCount={cartCount} />
      
      <div className="checkout-page">
        <div className="checkout-container">
          {orderPlaced ? (
            <div className="order-success-overlay">
              <div className="success-card">
                <div className="success-icon">
                  <FiCheck />
                </div>
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order. Your food is being prepared.</p>
                <div className="order-details">
                  <p>Order ID: <strong>ORD-{Date.now().toString().slice(-8)}</strong></p>
                  <p>Estimated delivery: <strong>30-45 minutes</strong></p>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <p className="redirect-message">Redirecting to orders...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="checkout-header">
                <h1 className="page-title">
                  <FiShoppingBag /> Checkout
                </h1>
                <div className="checkout-steps">
                  <div className="step active">
                    <span className="step-number">1</span>
                    <span className="step-label">Cart</span>
                  </div>
                  <div className="step-divider"></div>
                  <div className="step active">
                    <span className="step-number">2</span>
                    <span className="step-label">Details</span>
                  </div>
                  <div className="step-divider"></div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <span className="step-label">Payment</span>
                  </div>
                </div>
              </div>

              <div className="checkout-layout">
                <div className="checkout-form-section">
                  <form className="checkout-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                      <h3 className="section-title">
                        <FiHome /> Delivery Information
                      </h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            required
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                            required
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="form-input"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>City *</label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="form-select"
                          >
                            <option value="">Select City</option>
                            <option value="addis-ababa">Addis Ababa</option>
                            <option value="addama">Adama</option>
                            <option value="bahir-dar">Bahir Dar</option>
                            <option value="mekelle">Mekelle</option>
                            <option value="hawassa">Hawassa</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Subcity *</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="e.g., Bole, Kirkos, etc."
                            required
                            className="form-input"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Full Address *</label>
                        <textarea
                          name="additionalInfo"
                          value={formData.additionalInfo}
                          onChange={handleInputChange}
                          placeholder="House number, street, landmark..."
                          required
                          className="form-textarea"
                          rows="3"
                        />
                      </div>
                      
                      <div className="form-checkbox">
                        <input
                          type="checkbox"
                          id="saveInfo"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                        />
                        <label htmlFor="saveInfo">Save this information for next time</label>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3 className="section-title">
                        <FiCreditCard /> Payment Method
                      </h3>
                      <div className="payment-options">
                        <label className={`payment-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={formData.paymentMethod === 'cash'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <MdDeliveryDining className="payment-icon" />
                            <div>
                              <h4 style={{ color: formData.paymentMethod === 'cash' ? '#0074D9' : undefined }}>Cash on Delivery</h4>
                              <p>Pay when you receive your order</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <FiCreditCard className="payment-icon" />
                            <div>
                              <h4 style={{ color: formData.paymentMethod === 'card' ? '#0074D9' : undefined }}>Credit/Debit Card</h4>
                              <p>Pay securely with your card</p>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`payment-option ${formData.paymentMethod === 'mobile' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mobile"
                            checked={formData.paymentMethod === 'mobile'}
                            onChange={handleInputChange}
                          />
                          <div className="payment-content">
                            <FiPhone className="payment-icon" />
                            <div>
                              <h4 style={{ color: formData.paymentMethod === 'mobile' ? '#0074D9' : undefined }}>Mobile Payment</h4>
                              <p>CBE Birr, Telebirr, etc.</p>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="security-notice">
                        <FiLock className="lock-icon" />
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate(-1)}
                      >
                        Back to Cart
                      </button>
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <MdPayment />
                            Place Order - {total.toFixed(2)} ETB
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="order-summary-section">
                  <div className="summary-card">
                    <h3 className="summary-title">Order Summary</h3>
                    
                    <div className="order-items">
                      {cart.map(item => (
                        <div className="order-item" key={item._id}>
                          <div className="item-info">
                            <h4>{item.name}</h4>
                            <p className="item-category">{item.category}</p>
                          </div>
                          <div className="item-quantity">
                            <span className="quantity-badge">{item.quantity}x</span>
                            <span className="item-price">{item.price} ETB</span>
                          </div>
                          <div className="item-total">
                            {(item.price * item.quantity).toFixed(2)} ETB
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="summary-divider"></div>
                    
                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(2)} ETB</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery Fee</span>
                        <span className={deliveryFee === 0 ? 'free' : ''}>
                          {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(2)} ETB`}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (15%)</span>
                        <span>{tax.toFixed(2)} ETB</span>
                      </div>
                      
                      <div className="summary-divider"></div>
                      
                      <div className="summary-total">
                        <span>Total Amount</span>
                        <span className="total-amount">{total.toFixed(2)} ETB</span>
                      </div>
                    </div>
                    
                    <div className="delivery-info">
                      <FiMapPin className="delivery-icon" />
                      <div>
                        <h4>Delivery Estimate</h4>
                        <p>30-45 minutes to {formData.city || 'your city'}</p>
                      </div>
                    </div>
                    
                    <div className="guarantee-badge">
                      <FiCheck />
                      <span>100% Quality & Satisfaction Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Checkout;
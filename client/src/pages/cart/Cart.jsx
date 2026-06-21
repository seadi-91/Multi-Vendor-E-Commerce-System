import React from 'react';
import { useCart } from '../../context/CartContext';
import CustomerHeader from '../dashbord/customer/header/Header';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Cart.scss';

const Cart = () => {
  const { cart, removeFromCart, cartCount, incrementQuantity, decrementQuantity, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    navigate('/customer/checkout');
  };

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} cartCount={cartCount} />
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1 className="cart-title">Your Shopping Cart</h1>
            {cart.length > 0 && (
              <p className="cart-subtitle">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some delicious items to get started!</p>
              <button className="continue-shopping-btn">Continue Shopping</button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items-section">
                {cart.map(item => (
                  <div className="cart-item-card" key={item._id}>
                    <div className="cart-item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="item-image-placeholder">🍕</div>
                      )}
                    </div>
                    
                    <div className="cart-item-details">
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <span className="item-category">{item.category}</span>
                      </div>
                      
                      <p className="item-description">
                        {item.description || 'Delicious item waiting for you!'}
                      </p>
                      
                      <div className="item-controls">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => decrementQuantity(item._id)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => incrementQuantity(item._id, item.stock || 99)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="item-price">
                          <span className="price-unit">{item.price} ETB</span>
                          <span className="price-total">{item.price * item.quantity} ETB</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary-section">
                <div className="order-summary">
                  <h3 className="summary-title">Order Summary</h3>
                  
                  <div className="summary-row">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{total} ETB</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>{(total * 0.15).toFixed(2)} ETB</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-total">
                    <span>Total</span>
                    <span className="total-amount">{(total * 1.15).toFixed(2)} ETB</span>
                  </div>
                  
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                  
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Clear Cart
                  </button>
                  
                  <div className="payment-methods">
                    <p>We accept:</p>
                    <div className="payment-icons">
                      <span>💳</span>
                      <span>🏦</span>
                      <span>📱</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
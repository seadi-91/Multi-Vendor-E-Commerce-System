import React from 'react';
import { useCart } from '../../context/CartContext';
import CustomerHeader from '../dashbord/customer/header/Header';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, cartCount, incrementQuantity, decrementQuantity, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/customer/checkout');
  };

  return (
    <>
      <CustomerHeader user={user} onLogout={logout} cartCount={cartCount} />
      <div className="min-h-screen bg-slate-50 p-0">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-5 md:p-10 text-slate-800 mt-2.5 md:mt-10 mb-2.5 md:mb-10 mx-2.5 md:mx-auto">
          <div className="text-center mb-10 pb-5 border-b-2 border-slate-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2 tracking-tight">Your Shopping Cart</h1>
            {cart.length > 0 && (
              <p className="text-lg text-slate-500 font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20 text-black">
              <div className="text-7xl mb-5 opacity-50">🛒</div>
              <h2 className="text-3xl font-bold mb-3 text-black">Your cart is empty</h2>
              <p className="text-lg text-slate-500 mb-8">Add some delicious items to get started!</p>
              <button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-indigo-500/40"
                onClick={() => navigate('/')}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
              <div className="flex flex-col gap-5">
                {cart.map(item => (
                  <div 
                    className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto] gap-5 p-6 bg-white rounded-xl border border-slate-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-indigo-400 transition-all duration-300 relative animate-[slideIn_0.3s_ease-out]"
                    key={item._id}
                  >
                    <div className="w-24 h-24 md:w-24 md:h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 mx-auto md:mx-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                          🍕
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col text-center md:text-left">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mb-2">
                        <h3 className="text-xl font-bold text-black">{item.name}</h3>
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {item.category}
                        </span>
                      </div>
                      
                      <p className="text-slate-500 mb-4 leading-relaxed text-sm">
                        {item.description || 'Delicious item waiting for you!'}
                      </p>
                      
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3 bg-slate-100 rounded-full px-2 py-1">
                          <button
                            className="w-8 h-8 rounded-full border-none bg-white text-black text-lg cursor-pointer flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:scale-110 transition-all duration-200 disabled:opacity-50"
                            onClick={() => decrementQuantity(item._id)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-black min-w-[30px] text-center">{item.quantity}</span>
                          <button
                            className="w-8 h-8 rounded-full border-none bg-white text-black text-lg cursor-pointer flex items-center justify-center hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:scale-110 transition-all duration-200 disabled:opacity-50"
                            onClick={() => incrementQuantity(item._id, item.stock || 99)}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end">
                          <span className="text-sm text-slate-500">{item.price} ETB</span>
                          <span className="text-xl font-extrabold text-black">{item.price * item.quantity} ETB</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="bg-red-500 text-white border-none w-9 h-9 rounded-full text-xl cursor-pointer hover:rotate-90 hover:scale-110 hover:bg-red-600 transition-all duration-300 flex items-center justify-center absolute top-4 right-4 md:static"
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="sticky top-5">
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-black">
                  <h3 className="text-2xl font-extrabold text-black mb-6 pb-4 border-b-2 border-slate-100">Order Summary</h3>
                  
                  <div className="flex justify-between mb-4 text-black">
                    <span className="text-slate-500">Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-black">{total} ETB</span>
                  </div>
                  
                  <div className="flex justify-between mb-4 text-black">
                    <span className="text-slate-500">Delivery Fee</span>
                    <span className="font-semibold text-black">Free</span>
                  </div>
                  
                  <div className="flex justify-between mb-4 text-black">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-semibold text-black">{(total * 0.15).toFixed(2)} ETB</span>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-5"></div>
                  
                  <div className="flex justify-between items-center my-6">
                    <span className="text-xl font-bold text-black">Total</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      {(total * 1.15).toFixed(2)} ETB
                    </span>
                  </div>
                  
                  <button 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none py-4 rounded-xl text-lg font-bold cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 mb-4 shadow-indigo-500/40"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                  
                  <button 
                    className="w-full bg-transparent text-red-500 border-2 border-red-500 py-3 rounded-xl text-base font-semibold cursor-pointer hover:bg-red-500 hover:text-white transition-all duration-300"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>
                  
                  <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                    <p className="text-slate-500 mb-3 text-sm">We accept:</p>
                    <div className="flex justify-center gap-4 text-2xl">
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
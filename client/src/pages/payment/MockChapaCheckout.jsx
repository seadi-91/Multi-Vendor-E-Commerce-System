import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Check, CreditCard } from 'lucide-react';

/**
 * Mock Chapa Checkout Page
 * Simulates Chapa's hosted checkout page for development
 * This appears when using mock mode (invalid API key)
 */
const MockChapaCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const tx_ref = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');
  const email = searchParams.get('email');
  
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    // Auto-redirect after 30 seconds if no action
    const timeout = setTimeout(() => {
      handleCancel();
    }, 30000);

    return () => clearTimeout(timeout);
  }, []);

  const handlePayment = () => {
    if (paymentMethod === 'card' || (paymentMethod === 'mobile' && phone.length >= 9)) {
      setProcessing(true);
      
      // Simulate payment processing
      setTimeout(() => {
        // Redirect to success page with tx_ref
        window.location.href = `http://localhost:5173/payment-success?tx_ref=${tx_ref}`;
      }, 2000);
    }
  };

  const handleCancel = () => {
    navigate('/customer/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mock Chapa Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500 px-6 py-3 rounded-2xl shadow-2xl">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-emerald-600 font-black text-xl">C</span>
            </div>
            <span className="text-white font-black text-2xl">Chapa</span>
          </div>
          <p className="text-emerald-400 text-sm mt-4 font-semibold">
            🧪 MOCK PAYMENT MODE (No real Chapa API key)
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-black mb-2">Complete Payment</h2>
            <p className="text-emerald-100 text-sm">Secure payment powered by Chapa</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Amount Display */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Amount to Pay</p>
                <p className="text-4xl font-black text-emerald-700">{amount} ETB</p>
                <p className="text-xs text-slate-500 mt-2">Transaction: {tx_ref}</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Select Payment Method
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-emerald-500' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'card' && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Card Payment</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('mobile')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'mobile'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'mobile' ? 'border-emerald-500' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'mobile' && (
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Mobile Money</span>
                </button>
              </div>
            </div>

            {/* Mobile Payment Input */}
            {paymentMethod === 'mobile' && (
              <div className="animate-in slide-in-from-top duration-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XX XXX XXX"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Card Info (if card selected) */}
            {paymentMethod === 'card' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-in slide-in-from-top duration-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">Test Card Numbers:</p>
                <p className="text-xs text-blue-700">Success: 4200 0000 0000 0000</p>
                <p className="text-xs text-blue-700">Failure: 5200 0000 0000 0000</p>
                <p className="text-xs text-blue-600 mt-2">CVV: Any 3 digits | Expiry: Any future date</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing || (paymentMethod === 'mobile' && phone.length < 9)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Info */}
            <div className="text-center text-xs text-slate-500 space-y-1">
              <p>🔒 Secured by Chapa</p>
              <p className="text-amber-600 font-semibold">
                ⚠️ Mock Mode: This is a simulated payment page
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-amber-900 mb-2">
            📋 Development Mode Active
          </p>
          <p className="text-xs text-amber-700 leading-relaxed">
            You're seeing this mock checkout because no valid Chapa API key is configured. 
            Get a real API key from <a href="https://dashboard.chapa.co" target="_blank" rel="noopener noreferrer" className="underline font-semibold">dashboard.chapa.co</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockChapaCheckout;

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Check, Loader2, Star } from 'lucide-react';
import api from '../../api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get transaction reference from URL params
      const tx_ref = searchParams.get('tx_ref');
      const trx_ref = searchParams.get('trx_ref');
      const status = searchParams.get('status');
      
      console.log('Payment callback params:', { tx_ref, trx_ref, status });

      if (!tx_ref && !trx_ref) {
        throw new Error('Invalid payment reference');
      }

      const transactionRef = tx_ref || trx_ref;

      // Call backend to verify payment with Chapa
      const verifyResponse = await api.get(`/payments/chapa/verify/${transactionRef}`);
      
      console.log('Verification response:', verifyResponse.data);

      if (verifyResponse.data.status === 'success') {
        setVerificationStatus('success');
        setOrderDetails(verifyResponse.data.order || {});
        
        // Clear cart after successful payment
        clearCart();
        
        // Auto-redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setError(error?.response?.data?.message || error.message || 'Payment verification failed');
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOkClick = () => {
    // Log rating and comment
    if (rating > 0 || comment.trim()) {
      console.log('User Feedback:', { rating, comment });
      
      // Save to localStorage
      const feedback = {
        rating,
        comment: comment.trim(),
        timestamp: new Date().toISOString(),
        orderId: orderDetails?.id || Date.now()
      };
      localStorage.setItem('lastOrderFeedback', JSON.stringify(feedback));
      
      // TODO: Send to backend API
      // await api.post('/feedback', feedback);
    }
    
    clearCart();
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-lg shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <Loader2 className="w-14 h-14 animate-spin" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Verifying Payment...
          </h2>
          <p className="text-gray-600 text-lg">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed' || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-lg shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            {error || 'We could not verify your payment. Please contact support.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 text-center max-w-2xl w-full shadow-2xl transform animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Check className="w-16 h-16" strokeWidth={3} />
        </div>
        
        {/* Thank You Message in Amharic - Updated */}
        <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          ትዕዛዝህን በስኬት አጠናቀሃል፣ እናመሰግናለን!
        </h2>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">
          Order Completed Successfully, Thank You!
        </h3>
        <p className="text-gray-600 text-lg mb-6">
          የክፍያ ሂደትዎ ተጠናቋል።
        </p>

        {orderDetails && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-emerald-200">
            <div className="space-y-3">
              {orderDetails.orderCode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-bold text-gray-900">{orderDetails.orderCode}</span>
                </div>
              )}
              {orderDetails.total && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Order Total</span>
                  <span className="font-bold text-emerald-700 text-xl">{orderDetails.total.toFixed(2)} ETB</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated Delivery</span>
                <span className="font-semibold text-gray-900">30-45 minutes</span>
              </div>
            </div>
          </div>
        )}

        {/* Rating & Comment Section */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-emerald-200 text-left">
          {/* Star Rating */}
          <div className="mb-6">
            <p className="text-gray-800 font-bold mb-3 text-base">
              አገልግሎታችንን ደረጃ ይስጡ:
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Rate Our Service:
            </p>
            
            {/* Interactive Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded"
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-300'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <p className="text-emerald-600 font-semibold text-center text-sm animate-in fade-in duration-200">
                ✓ You rated {rating} star{rating !== 1 ? 's' : ''}! Thank you for your feedback.
              </p>
            )}
          </div>

          {/* Comment Text Area */}
          <div>
            <label className="block text-gray-800 font-bold mb-3 text-base">
              አስተያየት ይስጡ:
            </label>
            <p className="text-gray-600 text-sm mb-3">
              Leave a Comment (Optional):
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="እባክዎን አስተያየትዎን እዚህ ይጻፉ (Comment)..."
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-gray-800 placeholder:text-gray-400 transition-all resize-none"
            />
            {comment && (
              <p className="text-gray-500 text-xs mt-2">
                {comment.length} character{comment.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleOkClick}
          className="w-full px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
        >
          OK
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Redirecting to home page in 3 seconds...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;


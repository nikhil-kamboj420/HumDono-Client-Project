// pages/LifetimeSubscription.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

export default function LifetimeSubscription() {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(699);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  const LIFETIME_PRICE = 699;

  useEffect(() => {
    loadRazorpayScript();
    checkUserGender();
  }, []);

  const checkUserGender = async () => {
    try {
      const response = await api.getUserProfile();
      setCurrentUser(response.user);
      
      // Redirect females away from subscription page
      if (response.user?.gender?.toLowerCase() === 'female') {
        showError('Subscription not required for female users', 'Free Access');
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // Redirect users who already have lifetime subscription
      if (response.user?.subscription?.isLifetime === true) {
        showSuccess('You already have lifetime access!', 'Active Subscription');
        setTimeout(() => navigate('/'), 1500);
        return;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code', 'Invalid Coupon');
      return;
    }

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: LIFETIME_PRICE,
        orderType: 'subscription'
      });

      if (response.success) {
        const discountAmount = response.discount.amount;
        setDiscount(discountAmount);
        setFinalPrice(LIFETIME_PRICE - discountAmount);
        showSuccess(`Coupon applied! ₹${discountAmount} off`, 'Success');
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Invalid coupon code', 'Coupon Error');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);

    try {
      // Create order
      const orderResponse = await api.post('/payments/create-order', {
        amount: finalPrice,
        type: 'lifetime_subscription',
        couponCode: couponCode || null
      });

      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const { orderId, amount, currency } = orderResponse;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'HumDono',
        description: 'Lifetime Subscription',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/verify-subscription', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isLifetime: true,
              couponCode: couponCode || null
            });

            if (verifyResponse.success) {
              showSuccess('Lifetime subscription activated! 🎉', 'Success');
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
          } catch (error) {
            showError('Payment verification failed', 'Error');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#cc0033'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      showError(error.response?.data?.error || 'Purchase failed', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Subscription Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white text-center">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Lifetime Access</h1>
            <p className="text-pink-100">Unlock unlimited messaging forever</p>
          </div>

          {/* Price */}
          <div className="p-8 text-center">
            {discount > 0 && (
              <div className="mb-2">
                <span className="text-2xl text-gray-400 line-through">₹{LIFETIME_PRICE}</span>
              </div>
            )}
            <div className="text-5xl font-bold text-gray-900 mb-2">
              ₹{finalPrice}
            </div>
            <p className="text-gray-600">One-time payment</p>
            {discount > 0 && (
              <div className="mt-2 inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                You save ₹{discount}!
              </div>
            )}
          </div>

          {/* Coupon Code */}
          <div className="px-8 pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="px-8 pb-8">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Get Lifetime Access'}
            </button>
          </div>

          {/* Info */}
          <div className="px-8 pb-8 text-center text-sm text-gray-500">
            <p>✓ Secure payment via Razorpay</p>
            <p>✓ Instant activation</p>
            <p>✓ No recurring charges</p>
          </div>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}

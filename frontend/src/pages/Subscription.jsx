// pages/Subscription.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { playSound } from '../utils/simpleSound';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    fetchPlans();
    fetchAvailableCoupons();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      if (response.success) {
        setPlans(response.plans);
        setCurrentSubscription(response.currentSubscription);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await api.get('/coupons/available?orderType=subscription');
      if (response.success) {
        setAvailableCoupons(response.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const validateCoupon = async (code, amount) => {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderAmount: amount,
        orderType: 'subscription'
      });

      if (response.success) {
        setAppliedCoupon(response);
        showSuccess(
          `Coupon applied! You save ₹${response.discount.amount}`,
          'Coupon Applied'
        );
        return response;
      }
    } catch (error) {
      showError(
        error.response?.data?.error || 'Invalid coupon code',
        'Coupon Error'
      );
      return null;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubscribe = async (planId) => {
    if (purchasing) return;
    navigate('/premium/passkey');
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'basic': return '🌟';
      case 'premium': return '👑';
      case 'gold': return '💎';
      default: return '⭐';
    }
  };

  const getPlanColor = (planId) => {
    switch (planId) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto romantic-pulse"></div>
          <p className="mt-4 text-white font-semibold">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-pink-200 lg:hidden"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-8 w-8 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Premium Plans</h1>
              <p className="text-white/80 mt-1">Unlock premium features</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Subscription Status */}
        {currentSubscription?.active && (
          <div className="card-romantic p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">👑</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Subscription</h3>
                <p className="text-gray-600 capitalize">{currentSubscription.plan} Plan</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Your subscription expires on {new Date(currentSubscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Coupon Section */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-passion mb-4">🎫 Coupons & Offers</h3>

          {appliedCoupon && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">{appliedCoupon.coupon.code}</p>
                  <p className="text-green-600 text-sm">{appliedCoupon.coupon.description}</p>
                  <p className="text-green-700 text-sm font-medium">
                    You save ₹{appliedCoupon.discount.amount} ({appliedCoupon.discount.percentage}% off)
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {!appliedCoupon && (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={() => couponCode && validateCoupon(couponCode, plans[0]?.price || 299)}
                  disabled={!couponCode}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>

              {availableCoupons.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="text-pink-600 text-sm font-medium hover:text-pink-700"
                  >
                    {showCoupons ? 'Hide' : 'Show'} available coupons ({availableCoupons.length})
                  </button>

                  {showCoupons && (
                    <div className="mt-3 space-y-2">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className="bg-pink-50 border border-pink-200 rounded-lg p-3 cursor-pointer hover:bg-pink-100"
                          onClick={() => {
                            setCouponCode(coupon.code);
                            setShowCoupons(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-pink-800">{coupon.code}</p>
                              <p className="text-pink-600 text-sm">{coupon.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-pink-700 text-sm font-medium">
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}% OFF`
                                  : `₹${coupon.discountValue} OFF`}
                              </p>
                              {coupon.minOrderAmount > 0 && (
                                <p className="text-pink-500 text-xs">Min ₹{coupon.minOrderAmount}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card-romantic p-6 relative overflow-hidden ${plan.isCurrent ? 'ring-2 ring-yellow-400' : ''
                }`}
            >
              {/* Popular Badge */}
              {plan.id === 'premium' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}

              {/* Current Badge */}
              {plan.isCurrent && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 text-xs font-semibold rounded-br-lg">
                  CURRENT
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} flex items-center justify-center text-2xl`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{plan.duration} days</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-passion">₹{plan.price}</p>
                  <p className="text-sm text-gray-600">+ {plan.coinsIncluded} coins</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {Object.entries(plan.features).map(([feature, enabled]) => (
                  enabled && (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  )
                ))}

                <div className="flex items-center space-x-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {plan.coinsIncluded} coins included
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={purchasing !== null || plan.isCurrent}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.isCurrent
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : purchasing === plan.id
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : `bg-gradient-to-r ${getPlanColor(plan.id)} text-white hover:shadow-lg hover:scale-105`
                  }`}
              >
                {plan.isCurrent
                  ? 'Current Plan'
                  : purchasing === plan.id
                    ? 'Processing...'
                    : `Subscribe to ${plan.name}`
                }
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-passion mb-4">Why Go Premium?</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">💕</div>
              <div>
                <p className="font-medium text-gray-900">Unlimited Likes</p>
                <p className="text-sm text-gray-600">Like as many profiles as you want</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">💬</div>
              <div>
                <p className="font-medium text-gray-900">Free Messaging</p>
                <p className="text-sm text-gray-600">Send unlimited messages without coins</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">👀</div>
              <div>
                <p className="font-medium text-gray-900">See Who Liked You</p>
                <p className="text-sm text-gray-600">Know who's interested in you</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">🚀</div>
              <div>
                <p className="font-medium text-gray-900">Profile Boost</p>
                <p className="text-sm text-gray-600">Get more visibility and matches</p>
              </div>
            </div>
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
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
};

export default Subscription;

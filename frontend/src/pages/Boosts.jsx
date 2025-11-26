// pages/Boosts.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SparklesIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { playNotificationSound } from '../utils/notificationSound';

const Boosts = () => {
  const [boostOptions, setBoostOptions] = useState([]);
  const [activeBoosts, setActiveBoosts] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [superLikes, setSuperLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    checkUserGender();
    fetchBoostData();
    fetchAvailableCoupons();
    checkSubscriptionRequirement();
  }, []);

  const checkUserGender = async () => {
    try {
      const response = await api.getUserProfile();
      setCurrentUser(response.user);
      
      // Redirect females away from boosts page
      if (response.user?.gender?.toLowerCase() === 'female') {
        showError('Boost purchases not required for female users', 'Free Access');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const checkSubscriptionRequirement = async () => {
    try {
      const response = await api.getUserProfile();
      if (response.user?.requiresFirstSubscription) {
        showError(
          "Please subscribe first to unlock boosts! 🔒",
          "Subscription Required"
        );
        setTimeout(() => {
          navigate('/subscription?required=true');
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const fetchBoostData = async () => {
    try {
      const response = await api.get('/boosts/available');
      setBoostOptions(response.boostOptions || []);
      setActiveBoosts(response.activeBoosts || []);
      setUserCoins(response.userCoins || 0);
      setSuperLikes(response.superLikes || 0);
    } catch (error) {
      console.error('Error fetching boost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await api.get('/coupons/available?orderType=boosts');
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
        orderType: 'boosts'
      });
      
      if (response.success) {
        setAppliedCoupon(response);
        showSuccess(
          `Coupon applied! You save ${response.discount.amount} coins`,
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

  const purchaseBoost = async (boostType) => {
    setPurchasing(boostType);
    
    const boost = boostOptions.find(b => b.type === boostType);
    if (!boost) return;
    
    let finalCost = boost.coinCost;
    let discountAmount = 0;
    
    // Apply coupon if available
    if (appliedCoupon) {
      finalCost = boost.coinCost - appliedCoupon.discount.amount;
      discountAmount = appliedCoupon.discount.amount;
    }
    
    try {
      const response = await api.post('/boosts/purchase', { 
        boostType,
        couponCode: appliedCoupon?.coupon?.code || null,
        originalCost: boost.coinCost,
        finalCost,
        discountAmount
      });
      
      playNotificationSound('boost');
      
      const message = appliedCoupon 
        ? `${boostType} boost activated! You saved ${discountAmount} coins with coupon ${appliedCoupon.coupon.code}! 🚀`
        : `${boostType} boost activated! 🚀`;
        
      showSuccess(response.message || message, 'Boost Activated');
      
      // Clear applied coupon
      setAppliedCoupon(null);
      setCouponCode('');
      
      fetchBoostData(); // Refresh data
    } catch (error) {
      console.error('Error purchasing boost:', error);
      playNotificationSound('error');
      if (error.response?.data?.error === 'Insufficient coins') {
        showError(
          `You need ${error.response.data.required} coins but only have ${error.response.data.balance} coins. 💰`,
          'Insufficient Coins'
        );
      } else {
        showError('Failed to purchase boost. Please try again.', 'Purchase Failed');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const getBoostIcon = (type) => {
    switch (type) {
      case 'visibility':
        return EyeIcon;
      case 'superlike':
        return HeartIcon;
      case 'rewind':
        return ArrowLeftIcon;
      default:
        return SparklesIcon;
    }
  };

  const getBoostColor = (type) => {
    switch (type) {
      case 'visibility':
        return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'superlike':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'rewind':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-pink-500 bg-pink-50 border-pink-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading boosts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-8 w-8 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Boosts</h1>
              <p className="text-gray-600 mt-1">Increase your popularity</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Your coins</p>
              <p className="text-lg font-bold text-yellow-600">{userCoins}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Active Boosts */}
        {activeBoosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Boosts</h2>
            <div className="space-y-3">
              {activeBoosts.map((boost) => {
                const Icon = getBoostIcon(boost.type);
                const timeLeft = new Date(boost.expiresAt) - new Date();
                const minutesLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60)));
                
                return (
                  <div key={boost._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 capitalize">{boost.type} Boost</h3>
                        <p className="text-green-700 text-sm">
                          {minutesLeft > 0 ? `${minutesLeft} minutes left` : 'Expired'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Super Likes Count */}
        {superLikes > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <HeartIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Super Likes Available</h3>
                  <p className="text-blue-700 text-sm">You have {superLikes} super likes to use</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-pink-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎫 Coupons & Offers</h3>
            
            {/* Applied Coupon Display */}
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">{appliedCoupon.coupon.code}</p>
                    <p className="text-green-600 text-sm">{appliedCoupon.coupon.description}</p>
                    <p className="text-green-700 text-sm font-medium">
                      You save {appliedCoupon.discount.amount} coins ({appliedCoupon.discount.percentage}% off)
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

            {/* Coupon Input */}
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
                    onClick={() => couponCode && validateCoupon(couponCode, boostOptions[0]?.coinCost || 50)}
                    disabled={!couponCode}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>

                {/* Available Coupons */}
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
                                    : `${coupon.discountValue} coins OFF`}
                                </p>
                                {coupon.minOrderAmount > 0 && (
                                  <p className="text-pink-500 text-xs">Min {coupon.minOrderAmount} coins</p>
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
        </div>

        {/* Boost Options */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Boosts</h2>
          <div className="space-y-4">
            {boostOptions.map((boost) => {
              const Icon = getBoostIcon(boost.type);
              const colorClass = getBoostColor(boost.type);
              
              return (
                <div key={boost.type} className={`border rounded-lg p-4 ${colorClass}`}>
                  <div className="flex items-start space-x-4">
                    <Icon className="w-8 h-8 mt-1" />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 capitalize mb-1">
                        {boost.type} {boost.type === 'superlike' ? 'Pack' : 'Boost'}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">{boost.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Price Display with Coupon */}
                          {appliedCoupon ? (
                            <div>
                              <span className="text-gray-500 line-through text-sm">{boost.coinCost} coins</span>
                              <span className="text-green-600 font-semibold ml-2">
                                {boost.coinCost - appliedCoupon.discount.amount} coins
                              </span>
                              <span className="text-green-600 text-xs ml-1">
                                (Save {appliedCoupon.discount.amount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-yellow-600 font-semibold">{boost.coinCost} coins</span>
                          )}
                          {boost.duration > 0 && (
                            <span className="text-gray-600 text-sm">• {boost.duration} min</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => purchaseBoost(boost.type)}
                          disabled={purchasing === boost.type || userCoins < (appliedCoupon ? boost.coinCost - appliedCoupon.discount.amount : boost.coinCost)}
                          className="bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {purchasing === boost.type ? 'Purchasing...' : 'Buy Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Need More Coins */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need more coins?</p>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600"
          >
            Buy Coins
          </button>
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

export default Boosts;
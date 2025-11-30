import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { openUpiIntent } from '../utils/upi';

export default function LifetimeAccess() {
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showCoupons, setShowCoupons] = useState(false);
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    const basePrice = 699;
    const finalPrice = appliedCoupon
        ? basePrice - appliedCoupon.discount.amount
        : basePrice;

    useEffect(() => {
        fetchAvailableCoupons();
    }, []);

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

    const validateCoupon = async () => {
        if (!couponCode.trim()) {
            showError('Please enter a coupon code', 'Invalid Input');
            return;
        }

        try {
            const response = await api.post('/coupons/validate', {
                code: couponCode,
                orderAmount: basePrice,
                orderType: 'subscription'
            });

            if (response.success) {
                setAppliedCoupon(response);
                showSuccess(
                    `Coupon applied! You save ₹${response.discount.amount}`,
                    'Coupon Applied'
                );
            }
        } catch (error) {
            showError(
                error.response?.data?.error || 'Invalid coupon code',
                'Coupon Error'
            );
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleUpiPayment = () => {
        openUpiIntent(finalPrice);
    };

    const handleScannerPayment = () => {
        // Store payment data for scanner page
        sessionStorage.setItem('lifetimePayment', JSON.stringify({
            amount: finalPrice,
            basePrice: basePrice,
            discount: appliedCoupon ? appliedCoupon.discount.amount : 0,
            coupon: appliedCoupon ? appliedCoupon.coupon : null
        }));
        navigate('/scanner-payment');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 lg:pr-64 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-700 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Back to Home</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Lifetime Access Card */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-8 text-white text-center shadow-2xl mb-6">
                    <div className="text-5xl mb-4">✨</div>
                    <h1 className="text-4xl font-bold mb-3">Lifetime Access</h1>
                    <p className="text-lg text-white/90">Unlock unlimited messaging forever</p>
                </div>

                {/* Pricing Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl mb-6">
                    {/* Price Display */}
                    <div className="text-center mb-6">
                        {appliedCoupon && (
                            <p className="text-gray-500 line-through text-xl">₹{basePrice}</p>
                        )}
                        <p className="text-5xl font-bold text-gray-900">₹{finalPrice}</p>
                        <p className="text-gray-600 mt-2">One-time payment</p>
                        {appliedCoupon && (
                            <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full mt-3">
                                <p className="font-semibold">You save ₹{appliedCoupon.discount.amount}!</p>
                            </div>
                        )}
                    </div>

                    {/* Coupon Section */}
                    <div className="mb-6">
                        <p className="text-gray-700 font-medium mb-3">Have a coupon code?</p>

                        {appliedCoupon ? (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-green-800">{appliedCoupon.coupon.code}</p>
                                        <p className="text-green-600 text-sm">{appliedCoupon.coupon.description}</p>
                                    </div>
                                    <button
                                        onClick={removeCoupon}
                                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex space-x-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                                    />
                                    <button
                                        onClick={validateCoupon}
                                        disabled={!couponCode}
                                        className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                                            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                                {availableCoupons.map((coupon) => (
                                                    <div
                                                        key={coupon.code}
                                                        className="bg-pink-50 border border-pink-200 rounded-lg p-3 cursor-pointer hover:bg-pink-100 transition"
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
                                                                <p className="text-pink-700 font-medium text-sm">
                                                                    {coupon.discountType === 'percentage'
                                                                        ? `${coupon.discountValue}% OFF`
                                                                        : `₹${coupon.discountValue} OFF`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* UPI Payment Button */}
                    <button
                        onClick={handleUpiPayment}
                        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mb-3"
                    >
                        Get Lifetime Access
                    </button>

                    {/* Scanner Payment Button */}
                    <button
                        onClick={handleScannerPayment}
                        className="w-full bg-white border-2 border-pink-500 text-pink-500 py-4 rounded-xl font-bold text-lg hover:bg-pink-50 transition"
                    >
                        Pay with Scanner
                    </button>
                </div>

                {/* Guarantee Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start space-x-3">
                        <div className="text-3xl">✅</div>
                        <div>
                            <h3 className="font-bold text-green-800 text-lg mb-2">100% Money-Back Guarantee</h3>
                            <p className="text-green-700">
                                Guaranteed match within one month or full payment refund to your account
                            </p>
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
}

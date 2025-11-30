import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import api from "../lib/api";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "../components/CustomAlert";
import { openUpiIntent } from "../utils/upi";

/**
 * Enhanced Wallet page with payment processing
 */
export default function Wallet() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.getUserProfile();
      setUser(response.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/payments/transactions");
      if (response.success) {
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const validateCoupon = async (code, amount) => {
    try {
      const response = await api.post("/coupons/validate", {
        code,
        orderAmount: amount,
        orderType: "coins",
      });

      if (response.success) {
        setAppliedCoupon(response);
        showSuccess(
          `Coupon applied! You save ₹${response.discount.amount}`,
          "Coupon Applied"
        );
        return response;
      }
    } catch (error) {
      showError(
        error.response?.data?.error || "Invalid coupon code",
        "Coupon Error"
      );
      return null;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const coinPackages = [
    { coins: 600, price: 499, bonus: 101, popular: false },
    { coins: 1150, price: 999, bonus: 151, popular: false },
    { coins: 2200, price: 1999, bonus: 201, popular: true },
    { coins: 6000, price: 4999, bonus: 1001, popular: false },
  ];

  const handleBuyCoins = (pkg) => {
    if (purchasing) return;
    setSelectedPackage(pkg);
    setPurchasing(pkg.coins + pkg.bonus);
  };

  const handleUpiPayment = () => {
    if (!selectedPackage) return;

    const finalPrice = appliedCoupon
      ? selectedPackage.price - appliedCoupon.discount.amount
      : selectedPackage.price;

    openUpiIntent(finalPrice);

    // Close modal and show success
    setSelectedPackage(null);
    setPurchasing(null);
    showSuccess(
      "Opening UPI app. Complete the payment and enter your passkey in Profile to activate coins.",
      "Payment Processing"
    );
  };

  const handleScannerPayment = () => {
    if (!selectedPackage) return;

    const finalPrice = appliedCoupon
      ? selectedPackage.price - appliedCoupon.discount.amount
      : selectedPackage.price;

    // Store payment data for scanner page
    sessionStorage.setItem('walletPayment', JSON.stringify({
      amount: finalPrice,
      basePrice: selectedPackage.price,
      discount: appliedCoupon ? appliedCoupon.discount.amount : 0,
      coupon: appliedCoupon ? appliedCoupon.coupon : null,
      coins: selectedPackage.coins + selectedPackage.bonus,
      package: selectedPackage
    }));

    navigate('/wallet-scanner-payment');
  };

  const closePaymentModal = () => {
    setSelectedPackage(null);
    setPurchasing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto romantic-pulse"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // Redirect females - they don't need to buy coins (CHECK THIS FIRST!)
  if (user?.gender?.toLowerCase() === "female") {
    return (
      <div className="min-h-screen bg-sunset-gradient lg:pr-64 pb-20 lg:pb-0">
        {/* Header */}
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
                onClick={() => navigate("/")}
              />
              <div>
                <h1 className="text-2xl font-bold text-passion">
                  💝 Free for You!
                </h1>
                <p className="text-gray-600">Unlimited messaging</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Free Benefits Card */}
          <div className="bg-romantic-gradient rounded-xl p-8 text-white shadow-romantic text-center">
            <div className="text-6xl mb-4 love-float">👑</div>
            <h2 className="text-2xl font-bold mb-2">You're Special!</h2>
            <p className="text-white/90 mb-4">
              As a female user, you get unlimited messaging for FREE! 💕
            </p>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm">✨ No coins needed</p>
              <p className="text-sm">✨ Unlimited messages</p>
              <p className="text-sm">✨ All features free</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="card-romantic p-6">
            <h3 className="text-lg font-semibold text-passion mb-3">
              💬 Messaging
            </h3>
            <p className="text-gray-600 mb-4">
              You can send unlimited messages to all your matches without any
              cost!
            </p>
            <button
              onClick={() => navigate("/messages")}
              className="w-full btn-romantic py-3"
            >
              Go to Messages
            </button>
          </div>

          {/* Why Free Section */}
          <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-passion mb-3">
              Why is it free?
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              We believe in creating a balanced community. Female users get free
              access to encourage more genuine connections and conversations. 💕
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if male user has lifetime subscription (ONLY FOR MALE USERS)
  // If no lifetime subscription, redirect to subscription page
  const hasLifetimeSubscription = user?.subscription?.isLifetime === true;

  if (user?.gender?.toLowerCase() === "male" && !hasLifetimeSubscription) {
    return (
      <div className="min-h-screen bg-sunset-gradient lg:pr-64 pb-20 lg:pb-0">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="card-romantic p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-passion mb-4">
              Subscription Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please subscribe first to unlock coin purchases and start
              chatting!
            </p>
            <button
              onClick={() => navigate("/subscription?required=true")}
              className="btn-romantic py-3 px-6 w-full"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient lg:pr-64 pb-20 lg:pb-0">
      {/* Header */}
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
              onClick={() => navigate("/")}
            />
            <div>
              <h2 className="text-2xl font-bold text-passion">💰 Wallet</h2>
              <p className="text-gray-600">Manage your coins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Balance */}
        <div className="bg-romantic-gradient rounded-xl p-6 text-white shadow-romantic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Current Balance</p>
              <p className="text-4xl font-bold">{user?.coins || 0}</p>
              <p className="text-white/80 text-sm">Coins</p>
            </div>
            <div className="text-5xl love-float">💰</div>
          </div>
        </div>

        {/* Messaging Cost Info */}
        <div className="card-romantic p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💬</div>
            <div>
              <p className="font-semibold text-passion">Message Cost</p>
              <p className="text-gray-600 text-sm">10 coins per message</p>
              <p className="text-gray-500 text-xs">
                First message to each match is free
              </p>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-passion mb-4">
            🎫 Coupons & Offers
          </h3>

          {/* Applied Coupon Display */}
          {appliedCoupon && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">
                    {appliedCoupon.coupon.code}
                  </p>
                  <p className="text-green-600 text-sm">
                    {appliedCoupon.coupon.description}
                  </p>
                  <p className="text-green-700 text-sm font-medium">
                    You save ₹{appliedCoupon.discount.amount} (
                    {appliedCoupon.discount.percentage}% off)
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
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                onClick={() =>
                  couponCode &&
                  validateCoupon(couponCode, coinPackages[0].price)
                }
                disabled={!couponCode}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Buy Coins */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-passion mb-4">
            💎 Buy Coins
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {coinPackages.map((pkg, index) => {
              const finalPrice = appliedCoupon
                ? pkg.price - appliedCoupon.discount.amount
                : pkg.price;

              return (
                <div
                  key={index}
                  className={`border-2 rounded-xl p-4 hover:border-pink-400 transition-all hover-romantic ${pkg.popular ? "border-pink-400 bg-pink-50" : "border-pink-200"
                    }`}
                >
                  <div className="text-center">
                    {pkg.popular && (
                      <span className="inline-block text-xs bg-romantic-gradient text-white px-2 py-1 rounded-full mb-2">
                        Popular
                      </span>
                    )}
                    <p className="text-3xl font-bold text-passion">
                      {pkg.coins + pkg.bonus}
                    </p>
                    <p className="text-sm text-gray-600">coins</p>
                    {pkg.bonus > 0 && (
                      <p className="text-xs text-green-600 font-semibold">
                        +{pkg.bonus} bonus!
                      </p>
                    )}

                    <div className="mt-2">
                      {appliedCoupon && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{pkg.price}
                        </p>
                      )}
                      <p className="text-sm font-bold text-passion">
                        ₹{finalPrice}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyCoins(pkg)}
                      disabled={purchasing !== null}
                      className="w-full mt-3 btn-romantic py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-passion mb-4">
            📜 Recent Transactions
          </h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">💳</p>
              <p>No transactions yet</p>
              <p className="text-sm">Your purchase history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.coins} Coins
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-passion">
                      ₹{transaction.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${transaction.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="font-semibold text-blue-800">Need Help?</p>
              <p className="text-blue-600 text-sm">
                Contact support if you face any payment issues
              </p>
              <p className="text-blue-600 text-sm">
                Refunds processed within 5-7 business days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Payment Method
              </h3>
              <p className="text-gray-600">
                {selectedPackage.coins + selectedPackage.bonus} Coins
              </p>
              <div className="mt-4">
                {appliedCoupon && (
                  <p className="text-gray-500 line-through text-lg">
                    ₹{selectedPackage.price}
                  </p>
                )}
                <p className="text-3xl font-bold text-pink-600">
                  ₹{appliedCoupon
                    ? selectedPackage.price - appliedCoupon.discount.amount
                    : selectedPackage.price}
                </p>
                {appliedCoupon && (
                  <p className="text-green-600 text-sm mt-1">
                    Saved ₹{appliedCoupon.discount.amount} with {appliedCoupon.coupon.code}
                  </p>
                )}
              </div>
            </div>

            {/* UPI Intent Button */}
            <button
              onClick={handleUpiPayment}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mb-3"
            >
              Pay with UPI Intent
            </button>

            {/* Scanner Payment Button */}
            <button
              onClick={handleScannerPayment}
              className="w-full bg-white border-2 border-pink-500 text-pink-500 py-4 rounded-xl font-bold text-lg hover:bg-pink-50 transition mb-3"
            >
              Pay with Scanner
            </button>

            {/* Cancel Button */}
            <button
              onClick={closePaymentModal}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>

            {/* Note */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs text-center">
                <span className="font-bold">Note:</span> After payment, go to Profile and enter your passkey to activate coins.
              </p>
            </div>
          </div>
        </div>
      )}

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

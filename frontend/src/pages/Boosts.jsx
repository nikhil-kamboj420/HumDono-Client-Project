// pages/Boosts.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import api from "../lib/api";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { playNotificationSound } from "../utils/notificationSound";

const Boosts = () => {
  const [boostOptions, setBoostOptions] = useState([]);
  const [activeBoosts, setActiveBoosts] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [superLikes, setSuperLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    checkUserAndSubscription();
    fetchBoostData();
    fetchAvailableCoupons();
  }, []);

  const checkUserAndSubscription = async () => {
    try {
      const response = await api.getUserProfile();
      setCurrentUser(response.user);

      // Redirect females away from boosts page - they get free features
      if (response.user?.gender?.toLowerCase() === "female") {
        showError(
          "Boost purchases not required for female users",
          "Free Access"
        );
        setTimeout(() => navigate("/"), 1500);
        return;
      }

      // Check if male user has lifetime subscription
      const isMale = response.user?.gender?.toLowerCase() === "male";
      const hasLifetimeSubscription =
        response.user?.subscription?.isLifetime === true;

      if (isMale && !hasLifetimeSubscription) {
        showError(
          "Please subscribe first to unlock boosts! 🔒",
          "Subscription Required"
        );
        setTimeout(() => {
          navigate("/subscription?required=true");
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchBoostData = async () => {
    try {
      const response = await api.get("/boosts/available");
      setBoostOptions(response.boostOptions || []);
      setActiveBoosts(response.activeBoosts || []);
      setUserCoins(response.userCoins || 0);
      setSuperLikes(response.superLikes || 0);
    } catch (error) {
      console.error("Error fetching boost data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await api.get("/coupons/available?orderType=boosts");
      if (response.success) {
        setAvailableCoupons(response.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const validateCoupon = async (code, amount) => {
    try {
      const response = await api.post("/coupons/validate", {
        code,
        orderAmount: amount,
        orderType: "boosts",
      });

      if (response.success) {
        setAppliedCoupon(response);
        showSuccess(
          `Coupon applied! You save ${response.discount.amount} coins`,
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

  const purchaseBoost = async (boostType) => {
    if (purchasing) return;

    const boost = boostOptions.find((b) => b.type === boostType);
    if (!boost) return;

    // Payment disabled
    showError("Online payments are currently disabled.", "Payments Disabled");
    return;
  };

  const getBoostIcon = (type) => {
    switch (type) {
      case "visibility":
        return EyeIcon;
      case "superlike":
        return HeartIcon;
      case "spotlight":
        return SparklesIcon;
      default:
        return SparklesIcon;
    }
  };

  const getBoostColor = (type) => {
    switch (type) {
      case "visibility":
        return "text-purple-500 bg-purple-50 border-purple-200";
      case "superlike":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "spotlight":
        return "text-yellow-500 bg-yellow-50 border-yellow-200";
      default:
        return "text-pink-500 bg-pink-50 border-pink-200";
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
              onClick={() => navigate("/")}
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
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Boosts</h2>
              <p className="text-gray-600 mt-1">Increase your popularity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Active Boosts */}
        {activeBoosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Active Boosts
            </h2>
            <div className="space-y-3">
              {activeBoosts.map((boost) => {
                const Icon = getBoostIcon(boost.type);
                const timeLeft = new Date(boost.expiresAt) - new Date();
                const minutesLeft = Math.max(
                  0,
                  Math.floor(timeLeft / (1000 * 60))
                );

                return (
                  <div
                    key={boost._id}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 capitalize">
                          {boost.type} Boost
                        </h3>
                        <p className="text-green-700 text-sm">
                          {minutesLeft > 0
                            ? `${minutesLeft} minutes left`
                            : "Expired"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Super Likes section removed */}

        {/* Boost Options */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Available Boosts
          </h2>
          <div className="space-y-4">
            {boostOptions
              .filter((b) => b.type !== "superlike")
              .map((boost) => {
                const Icon = getBoostIcon(boost.type);
                const colorClass = getBoostColor(boost.type);

                return (
                  <div
                    key={boost.type}
                    className={`border-2 rounded-xl p-5 ${colorClass}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-white shadow-sm">
                        <Icon className="w-8 h-8" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 capitalize text-lg mb-1">
                          {boost.type === "superlike"
                            ? "5 Super Likes Pack"
                            : boost.type === "visibility"
                            ? "Visibility Boost"
                            : boost.type === "spotlight"
                            ? "Spotlight Feature"
                            : boost.type}
                        </h3>
                        <p className="text-gray-700 text-sm mb-4">
                          {boost.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-pink-600">
                              {boost.coinCost} 🪙
                            </span>
                            {boost.duration > 0 && (
                              <span className="text-gray-500 text-sm">
                                • {boost.duration} min
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => navigate("/wallet")}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 shadow-lg transition-all"
                          >
                            Buy Coins
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="font-semibold text-blue-800">How Boosts Work</p>
              <p className="text-blue-600 text-sm mt-1">
                Boosts increase your visibility and help you get more matches.
                Visibility boost shows your profile to more users for 30
                minutes. Super Likes let the other person know you're really
                interested!
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
};

export default Boosts;

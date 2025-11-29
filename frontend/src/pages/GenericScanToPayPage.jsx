import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

/**
 * Generic Scan to Pay page that handles all payment types
 * Reads payment details from sessionStorage
 */
export default function GenericScanToPayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Get payment data from sessionStorage
    const storedData = sessionStorage.getItem("pendingPayment");
    if (storedData) {
      setPaymentData(JSON.parse(storedData));
    }
  }, []);

  // Determine back path and submit path based on payment type
  const getBackPath = () => {
    if (!paymentData) return "/";
    switch (paymentData.type) {
      case "coins":
        return "/wallet";
      case "boost":
        return "/boosts";
      case "subscription":
        return "/subscription";
      case "lifetime":
        return "/lifetime-access";
      default:
        return "/";
    }
  };

  const getSubmitPath = () => {
    if (!paymentData) return "/";
    switch (paymentData.type) {
      case "coins":
        return "/wallet/submit-transaction";
      case "boost":
        return "/boosts/submit-transaction";
      case "subscription":
        return "/subscription/submit-transaction";
      case "lifetime":
        return "/lifetime-access/submit-transaction";
      default:
        return "/";
    }
  };

  const getTitle = () => {
    if (!paymentData) return "Scan to Pay";
    switch (paymentData.type) {
      case "coins":
        return `Buy ${paymentData.coins} Coins`;
      case "boost":
        return `${paymentData.boostType} Boost`;
      case "subscription":
        return "Subscription";
      case "lifetime":
        return "Lifetime Access";
      default:
        return "Payment";
    }
  };

  const getAmount = () => {
    if (!paymentData) return 0;
    return paymentData.finalAmount || paymentData.price || 0;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No payment data found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => {
            // Clear payment data and go back to source page
            const backPath = getBackPath();
            sessionStorage.removeItem("pendingPayment");
            navigate(backPath, { replace: true });
          }}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-pink-100 mt-1">Scan to Pay via UPI</p>
          </div>

          <div className="p-6">
            {/* Amount Display */}
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm">Amount to Pay</p>
              <p className="text-4xl font-bold text-gray-900">₹{getAmount()}</p>
              {/* {paymentData.discountAmount > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  You save ₹{paymentData.discountAmount} with coupon!
                </p>
              )} */}
            </div>

            {/* QR Code */}
            {/* QR Code - TEMPORARILY DISABLED
            <div className="rounded-xl border-2 border-pink-200 bg-gray-50 p-4 flex items-center justify-center">
              <img
                src="/HUMDONO_UPI_SCANNER.jpg"
                alt="UPI QR Code"
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/qr-fallback.png";
                }}
              />
            </div>
            */}
            <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 font-medium">QR Code Payments Currently Unavailable</p>
              <p className="text-gray-400 text-sm mt-2">Please check back later</p>
            </div>

            {/* Instructions */}
            {/* Instructions - TEMPORARILY DISABLED
            <div className="mt-6 space-y-2 text-gray-700 text-sm">
              <p className="font-semibold text-gray-900">Instructions:</p>
              <p>1. Open your UPI app (GPay, PhonePe, Paytm, etc.)</p>
              <p>2. Scan the QR code above</p>
              <p>
                3. Enter the exact amount:{" "}
                <span className="font-bold text-pink-600">₹{getAmount()}</span>
              </p>
              <p>4. Complete the payment</p>
              <p>5. Note down the Transaction ID / UTR number</p>
            </div>
            */}

            {/* Payment Details Summary */}
            <div className="mt-6 bg-pink-50 rounded-lg p-4 border border-pink-200">
              <p className="font-semibold text-gray-900 mb-2">
                Payment Summary:
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                {paymentData.type === "coins" && (
                  <>
                    <p>
                      • Coins: {paymentData.coins} (includes {paymentData.bonus}{" "}
                      bonus)
                    </p>
                    <p>• Original Price: ₹{paymentData.price}</p>
                  </>
                )}
                {paymentData.type === "boost" && (
                  <>
                    <p>• Boost Type: {paymentData.boostType}</p>
                    <p>• Duration: {paymentData.duration} minutes</p>
                    <p>• Price: ₹{paymentData.price}</p>
                  </>
                )}
                {/* {paymentData.discountAmount > 0 && (
                  <p className="text-green-600">
                    • Discount: -₹{paymentData.discountAmount}
                  </p>
                )} */}
                <p className="font-bold text-pink-600">
                  • Final Amount: ₹{getAmount()}
                </p>
              </div>
            </div>

            {/* Next Button */}
            <button
              disabled={true}
              className="mt-6 w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
            >
              Payment Verification Disabled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

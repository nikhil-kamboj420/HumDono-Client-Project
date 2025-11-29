import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

/**
 * Generic Submit Transaction page that handles all payment types
 * Reads payment details from sessionStorage
 */
export default function GenericSubmitTransactionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    // Get payment data from sessionStorage
    const storedData = sessionStorage.getItem('pendingPayment');
    if (storedData) {
      setPaymentData(JSON.parse(storedData));
    }
  }, []);

  // Determine back path based on payment type
  const getBackPath = () => {
    if (!paymentData) return '/';
    switch (paymentData.type) {
      case 'coins': return '/wallet/scan-to-pay';
      case 'boost': return '/boosts/scan-to-pay';
      case 'subscription': return '/subscription/scan-to-pay';
      case 'lifetime': return '/lifetime-access/scan-to-pay';
      default: return '/';
    }
  };

  const getSuccessRedirect = () => {
    if (!paymentData) return '/';
    switch (paymentData.type) {
      case 'coins': return '/wallet';
      case 'boost': return '/boosts';
      case 'subscription': return '/';
      case 'lifetime': return '/';
      default: return '/';
    }
  };

  const getTitle = () => {
    if (!paymentData) return 'Submit Transaction';
    switch (paymentData.type) {
      case 'coins': return 'Submit Coin Purchase';
      case 'boost': return 'Submit Boost Purchase';
      case 'subscription': return 'Submit Subscription';
      case 'lifetime': return 'Submit Lifetime Access';
      default: return 'Submit Transaction';
    }
  };

  const getAmount = () => {
    if (!paymentData) return 0;
    return paymentData.finalAmount || paymentData.price || 0;
  };

  const handleSubmit = async () => {
    // Submission disabled
    showError("Transaction submission is currently disabled.", "Submission Disabled");
    return;
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No payment data found.</p>
          <button
            onClick={() => navigate('/')}
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
          onClick={() => navigate(getBackPath())}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Scan to Pay</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b text-center bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <p className="text-pink-100 mt-1">Enter your transaction details</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Payment Summary */}
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
              <p className="font-semibold text-gray-900 mb-2">Payment Summary:</p>
              <div className="text-sm text-gray-700 space-y-1">
                {paymentData.type === 'coins' && (
                  <p>• Coins: {paymentData.coins}</p>
                )}
                {paymentData.type === 'boost' && (
                  <p>• Boost: {paymentData.boostType}</p>
                )}
                <p className="font-bold text-pink-600">• Amount: ₹{getAmount()}</p>
              </div>
            </div>

            {/* Amount Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
              <input
                type="number"
                value={getAmount()}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Transaction ID Field - DISABLED */}
            <div>
              <p className="text-gray-500 text-center py-4">Transaction submission is currently disabled.</p>
            </div>

            {/* Submit Button */}
            <button
              disabled={true}
              className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
            >
              Submission Disabled
            </button>

            {/* Help Text */}
            <p className="text-center text-xs text-gray-500">
              Contact support if you face any issues.
            </p>
          </div>
        </div>
      </div>

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
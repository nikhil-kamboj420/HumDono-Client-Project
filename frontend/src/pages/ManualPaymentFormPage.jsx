import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

export default function ManualPaymentFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount: initialAmount } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(initialAmount !== undefined ? initialAmount : 699);
  const [transactionId, setTransactionId] = useState('');
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  const handleSubmit = async () => {
    try {
      const tx = String(transactionId).trim();
      if (!tx) {
        showError('Please enter the UPI Transaction ID / UTR', 'Missing Transaction ID');
        return;
      }
      setLoading(true);
      const res = await api.post('/manual-payments/request', {
        amount: Number(amount),
        transactionId: tx,
      });
      if (res?.ok) {
        showSuccess('Details submitted. We will verify your payment and activate Lifetime Access soon.', 'Submitted');
        setTimeout(() => navigate('/lifetime-access'), 2000);
      } else {
        showError(res?.error || 'Submission failed', 'Error');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Submission failed';
      showError(msg, 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/lifetime-access/scan-to-pay')}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Scan to Pay</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b text-center">
            <h1 className="text-2xl font-bold text-gray-900">Submit Transaction Details</h1>
            <p className="text-gray-600 mt-1">We will verify and activate Lifetime Access</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter UPI Transaction ID / UTR (Ref No✅) (NOT your UPI ID)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 103245678912"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Do NOT enter your UPI ID (like name@bank). Enter the numeric transaction reference / UTR from your payment app after successful payment.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting…' : 'Submit'}
            </button>
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


import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, QrCodeIcon } from '@heroicons/react/24/outline';

export default function ScanToPayPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/lifetime-access')}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Lifetime Access</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b text-center">
            <h1 className="text-2xl font-bold text-gray-900">Scan to Pay</h1>
            <p className="text-gray-600 mt-1">Use any UPI app to complete the payment</p>
          </div>

          <div className="p-6">
            <div className="rounded-xl border bg-gray-50 p-4 flex items-center justify-center">
              <img
                src="/HUMDONO_UPI_SCANNER.jpg"
                alt="UPI QR Code"
                className="w-64 h-64 object-contain"
                onError={(e) => { e.currentTarget.src = '/qr-fallback.png'; }}
              />
            </div>

            <div className="mt-6 space-y-2 text-gray-700">
              <p>1. Open your UPI app (GPay, PhonePe, Paytm, etc.)</p>
              <p>2. Scan the QR code above</p>
              <p>3. Enter the exact amount: <span className="font-semibold">₹699</span></p>
              <p>4. Complete the payment</p>
            </div>

            <button
              onClick={() => navigate('/lifetime-access/submit-transaction')}
              className="mt-6 w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              I have completed the payment – Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


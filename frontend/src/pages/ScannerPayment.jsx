import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ScannerPayment() {
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        const storedData = sessionStorage.getItem('lifetimePayment');
        if (storedData) {
            setPaymentData(JSON.parse(storedData));
        } else {
            // If no payment data, redirect back
            navigate('/subscription');
        }
    }, [navigate]);

    if (!paymentData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Scan to Pay Header */}
            <div className="bg-white pt-6 pb-4 px-4">
                <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Scan to Pay</h1>
                <p className="text-center text-gray-600">Use any UPI app to complete the payment</p>
            </div>

            {/* QR Code Section */}
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="bg-gray-50 rounded-3xl p-6 mb-6">
                    <div className="flex flex-col items-center">
                        {/* Brand Logo */}
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                            <span className="text-white font-bold text-2xl">H</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-4">Hum dono</p>

                        {/* QR Code */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
                            <img
                                src="/HUMDONO_UPI_SCANNER.jpg"
                                alt="UPI QR Code"
                                className="w-64 h-64 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'block';
                                }}
                            />
                            <div className="w-64 h-64 hidden flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="text-center">
                                    <p className="text-gray-500 font-medium">QR Code</p>
                                    <p className="text-gray-400 text-sm mt-2">humdonodating@okicici</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">UPI ID: humdonodating@okicici</p>
                        <p className="text-xs text-gray-500 mt-2">Scan to pay with any UPI app</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <p className="text-gray-700 pt-1">Open your UPI app (GPay, PhonePe, Paytm, etc.)</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                        <p className="text-gray-700 pt-1">Scan the QR code above</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <p className="text-gray-700 pt-1">
                            Enter the exact amount: <span className="font-bold text-pink-600">₹{paymentData.amount}</span>
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                        <p className="text-gray-700 pt-1">Complete the payment</p>
                    </div>
                </div>

                {/* Payment Summary */}
                {paymentData.discount > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-700">Original Price:</p>
                            <p className="text-gray-500 line-through">₹{paymentData.basePrice}</p>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-green-700 font-medium">Discount ({paymentData.coupon?.code}):</p>
                            <p className="text-green-700 font-medium">-₹{paymentData.discount}</p>
                        </div>
                        <div className="border-t-2 border-green-200 pt-2 mt-2">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-900 font-bold text-lg">Final Amount:</p>
                                <p className="text-pink-600 font-bold text-2xl">₹{paymentData.amount}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Complete Payment Button */}
                <button
                    onClick={() => {
                        sessionStorage.removeItem('lifetimePayment');
                        navigate('/');
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
                >
                    I have completed the payment →
                </button>

                {/* Note */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-800 text-sm text-center">
                        <span className="font-bold">Note:</span> Go to your Profile page and enter the Pass Key you received to activate your access.
                    </p>
                </div>
            </div>
        </div>
    );
}

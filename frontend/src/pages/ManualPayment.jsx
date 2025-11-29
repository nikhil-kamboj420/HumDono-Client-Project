import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ManualPayment() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-sunset-gradient flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-white/90 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <h1 className="text-2xl font-bold text-center">Scan to Pay</h1>
                    <p className="text-center text-pink-100 mt-1">Complete your payment manually</p>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center">
                    {/* QR Code - TEMPORARILY DISABLED
                    <div className="bg-white p-4 rounded-xl shadow-lg mb-6 border-2 border-pink-100">
                        <img
                            src="/HUMDONO_UPI_SCANNER.jpg"
                            alt="Scan to Pay"
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                    */}
                    <div className="bg-white p-8 rounded-xl shadow-lg mb-6 border-2 border-gray-100 text-center">
                        <p className="text-gray-500 font-medium">QR Code Payments Currently Unavailable</p>
                        <p className="text-gray-400 text-sm mt-2">Please check back later</p>
                    </div>

                    <div className="text-center space-y-4">
                        {/* Instructions - TEMPORARILY DISABLED
                        <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                            <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
                            <ol className="text-sm text-gray-600 text-left list-decimal pl-5 space-y-2">
                                <li>Open any UPI app (GPay, PhonePe, Paytm)</li>
                                <li>Scan the QR code above</li>
                                <li>Enter the amount for your selected plan/coins</li>
                                <li>Complete the payment</li>
                            </ol>
                        </div>
                        */}

                        <p className="text-sm text-gray-500 italic">
                            Note: Online payments are currently disabled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

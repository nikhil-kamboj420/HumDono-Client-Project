// pages/PremiumPassKey.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckBadgeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { openUpiIntent } from '../utils/upi';

const PremiumPassKey = () => {
    const [passKey, setPassKey] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    const handleActivate = async () => {
        if (!passKey.trim()) {
            showError('Please enter your Pass Key', 'Input Required');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/subscription/activate-passkey', { passKey });

            if (response.success) {
                showSuccess('🎉 Your lifetime premium is now active!', 'Success');
                setTimeout(() => {
                    navigate('/'); // Redirect to home or premium area
                }, 2000);
            }
        } catch (error) {
            console.error('Activation error:', error);
            showError(
                error.response?.data?.message || 'Something went wrong',
                'Activation Failed'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white text-center relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 top-6 text-white/80 hover:text-white"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Lifetime Premium</h1>
                    <p className="text-white/90 mt-1">Unlock everything forever</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Step 1: Payment */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                            <h2 className="text-lg font-semibold text-gray-800">Pay via UPI</h2>
                        </div>
                        <p className="text-gray-600 text-sm pl-11">
                            Pay <span className="font-bold text-gray-900">₹699</span> to get lifetime access.
                        </p>
                        <div className="pl-11">
                            <button
                                onClick={() => openUpiIntent(699)}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                            >
                                Pay ₹699 via UPI
                            </button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                After payment, our team will verify and call you with a Pass Key.
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* Step 2: Activation */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                            <h2 className="text-lg font-semibold text-gray-800">Enter Pass Key</h2>
                        </div>
                        <p className="text-gray-600 text-sm pl-11">
                            Enter the secret key provided by our team.
                        </p>
                        <div className="pl-11 space-y-3">
                            <div className="relative">
                                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                                <input
                                    type="text"
                                    value={passKey}
                                    onChange={(e) => setPassKey(e.target.value)}
                                    placeholder="Enter Pass Key"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleActivate}
                                disabled={loading || !passKey}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Activating...' : 'Activate Lifetime Premium'}
                            </button>
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

export default PremiumPassKey;

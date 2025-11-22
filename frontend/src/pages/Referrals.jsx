// pages/Referrals.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShareIcon, ClipboardIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';

const Referrals = () => {
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [codeResponse, referralsResponse] = await Promise.all([
        api.get('/referrals/my-code'),
        api.get('/referrals/my-referrals')
      ]);
      
      setReferralCode(codeResponse.referralCode);
      setStats(codeResponse.stats);
      setReferrals(referralsResponse.referrals || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralCode = async () => {
    const shareText = `Join me on HumDono dating app! Use my referral code: ${referralCode} and get bonus coins when you sign up!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join HumDono',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      copyReferralCode();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral data...</p>
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
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-8 w-8 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invite Friends</h1>
              <p className="text-gray-600 mt-1">Earn coins by referring friends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Referral Code Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="text-center">
            <UserPlusIcon className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-xl font-bold mb-2">Your Referral Code</h2>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold tracking-wider">{referralCode}</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={copyReferralCode}
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <ClipboardIcon className="w-5 h-5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={shareReferralCode}
                className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <p className="text-2xl font-bold text-pink-600">{stats.totalReferrals || 0}</p>
            <p className="text-gray-600 text-sm">Total Invites</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <p className="text-2xl font-bold text-green-600">{stats.completedReferrals || 0}</p>
            <p className="text-gray-600 text-sm">Joined</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
            <p className="text-2xl font-bold text-yellow-600">{stats.totalEarnings || 0}</p>
            <p className="text-gray-600 text-sm">Coins Earned</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How it Works</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p className="text-gray-700">Share your referral code with friends</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <p className="text-gray-700">They sign up using your code</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <p className="text-gray-700">You both get bonus coins!</p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Your Referrals</h3>
          </div>
          
          {referrals.length === 0 ? (
            <div className="p-6 text-center">
              <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No referrals yet</p>
              <p className="text-gray-500 text-sm">Start inviting friends to earn coins!</p>
            </div>
          ) : (
            <div className="divide-y">
              {referrals.map((referral) => (
                <div key={referral._id} className="p-4 flex items-center space-x-4">
                  <img
                    src={referral.referred.photos?.[0]?.url || '/default-avatar.png'}
                    alt={referral.referred.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{referral.referred.name}</h4>
                    <p className="text-gray-600 text-sm">
                      Joined {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'rewarded' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status === 'rewarded' ? 'Rewarded' : 'Pending'}
                    </span>
                    {referral.status === 'rewarded' && (
                      <p className="text-yellow-600 text-sm font-semibold mt-1">
                        +{referral.rewardAmount} coins
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
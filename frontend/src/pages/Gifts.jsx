// pages/Gifts.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, GiftIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import Navigation from '../components/Navigation';

const Gifts = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGifts();
    fetchUserCoins();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await api.get('/gifts');
      setGifts(response.gifts || []);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoins = async () => {
    try {
      const response = await api.getUserProfile();
      setUserCoins(response.user?.coins || 0);
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  const giftCategories = gifts.reduce((acc, gift) => {
    if (!acc[gift.category]) {
      acc[gift.category] = [];
    }
    acc[gift.category].push(gift);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 lg:hidden"
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
                <h1 className="text-2xl font-bold text-gray-900">Gifts</h1>
                <p className="text-gray-600 mt-1">Send virtual gifts to show you care</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Your coins</p>
              <p className="text-lg font-bold text-yellow-600">{userCoins}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white mb-6">
          <div className="flex items-center space-x-3">
            <GiftIcon className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">How Gifts Work</h3>
              <p className="text-sm opacity-90">Send gifts during conversations to show special interest and make your messages stand out!</p>
            </div>
          </div>
        </div>

        {/* Gift Categories */}
        {Object.entries(giftCategories).map(([category, categoryGifts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {category} ({categoryGifts.length})
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {categoryGifts.map((gift) => (
                <div key={gift._id} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{gift.name}</h3>
                    
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <span className="text-yellow-500">💰</span>
                      <span className="text-lg font-bold text-yellow-600">{gift.coinValue}</span>
                      <span className="text-sm text-gray-600">coins</span>
                    </div>
                    
                    <button
                      onClick={() => navigate('/matches')}
                      disabled={userCoins < gift.coinValue}
                      className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {userCoins < gift.coinValue ? 'Need More Coins' : 'Send in Chat'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* No Gifts Message */}
        {gifts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No gifts available</h3>
            <p className="text-gray-600">Gifts will be available soon!</p>
          </div>
        )}

        {/* Need More Coins */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need more coins to send gifts?</p>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-yellow-600"
          >
            Buy Coins
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Gifts;
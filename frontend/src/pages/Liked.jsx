// pages/Liked.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';

const Liked = () => {
  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLikedUsers();
  }, []);

  const fetchLikedUsers = async () => {
    try {
      const response = await api.get('/interactions/liked');
      setLikedUsers(response.likedUsers || []);
    } catch (error) {
      console.error('Error fetching liked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeInteraction = async (userId) => {
    if (!confirm('Remove this like? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/interactions/${userId}`);
      setLikedUsers(prev => prev.filter(item => item.user._id !== userId));
    } catch (error) {
      console.error('Error removing interaction:', error);
      alert('Failed to remove interaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <h2 className="text-2xl font-bold text-gray-900">People I Liked</h2>
              <p className="text-gray-600 mt-1">{likedUsers.length} people</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {likedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No likes yet</h3>
            <p className="text-gray-600 mb-6">Start swiping to like people you're interested in!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {likedUsers.map((item) => (
              <div key={item.user._id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.user.photos?.[0]?.url || '/default-avatar.png'}
                    alt={item.user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                      {item.action === 'superlike' && (
                        <span className="text-blue-500 text-sm">⭐ Super Like</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">Age: {item.user.age}</p>
                    <p className="text-gray-600 text-sm">{item.user.bio}</p>
                    <p className="text-gray-400 text-xs">
                      Liked on {new Date(item.likedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeInteraction(item.user._id)}
                    className="text-red-500 hover:text-red-600 p-2"
                    title="Remove like"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Liked;
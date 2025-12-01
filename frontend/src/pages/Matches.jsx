// pages/Matches.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Navigation from '../components/Navigation';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/messages');
      // Filter out invalid matches where user is missing
      const validMatches = (response.conversations || []).filter(m => m.user);
      setMatches(validMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (matchId, user) => {
    navigate(`/chat/${matchId}`, { state: { user } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-10 w-10 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <h2 className="text-xl font-bold text-gray-900">Matches</h2>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl">
            <div className="text-6xl mb-4">💕</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">Start swiping to find your perfect match!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600"
            >
              Start Swiping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.matchId}
                onClick={() => openChat(match.matchId, match.user)}
                className="bg-white rounded-xl p-4 shadow-sm border border-pink-50 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={match.user.photos?.[0]?.url || '/default-avatar.png'}
                      alt={match.user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-pink-100"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">
                        {match.user.name}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(match.lastMessageAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-pink-600 text-sm font-medium mt-1">
                      You matched with {match.user.name.split(' ')[0]}! 💖
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Matches;

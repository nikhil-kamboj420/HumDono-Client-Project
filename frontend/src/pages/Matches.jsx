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
      setMatches(response.conversations || []);
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
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-2">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-12 w-12 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <h2 className="text-2xl font-bold text-gray-900">Matches</h2>
          </div>
          <p className="text-gray-600 mt-1">{matches.length} matches</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {matches.length === 0 ? (
          <div className="text-center py-12">
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
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.matchId}
                onClick={() => openChat(match.matchId, match.user)}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={match.user.photos?.[0]?.url || '/default-avatar.png'}
                      alt={match.user.name}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${match.user._id}`); }}
                    />
                    {match.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {match.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {match.user.name}
                    </h3>
                    {match.lastMessage ? (
                      <p className="text-gray-600 text-sm truncate">
                        {match.lastMessage.messageType === 'gift' 
                          ? `🎁 ${match.lastMessage.content}`
                          : match.lastMessage.content
                        }
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Say hello! 👋</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {match.lastMessageAt ? new Date(match.lastMessageAt).toLocaleDateString() : 'New match'}
                    </p>
                  </div>
                  
                  <div className="text-pink-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

// pages/Messages.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import Navigation from '../components/Navigation';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    checkDirectMessageUser();
  }, []);

  // Check if user came from direct message (female clicking message button)
  const checkDirectMessageUser = async () => {
    const directUserData = sessionStorage.getItem('directMessageUser');
    if (directUserData) {
      try {
        const targetUser = JSON.parse(directUserData);
        sessionStorage.removeItem('directMessageUser');
        
        // Check if conversation already exists
        const response = await api.getConversations();
        const existingConv = response.conversations?.find(conv => 
          conv.otherUser?._id === targetUser._id
        );
        
        if (existingConv) {
          // Open existing conversation
          openChat(existingConv.matchId, existingConv.otherUser);
        } else {
          // Navigate to chat with user ID as matchId (will be created on first message)
          // Use special format: "direct_userId" to indicate direct message
          navigate(`/chat/direct_${targetUser._id}`, { 
            state: { 
              user: targetUser, 
              isDirectMessage: true 
            } 
          });
        }
      } catch (error) {
        console.error('Error handling direct message:', error);
      }
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
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
          <p className="mt-4 text-gray-600">Loading messages...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
          <p className="text-gray-600 mt-1">{conversations.length} conversations</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">Start matching with people to begin conversations!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.matchId}
                onClick={() => openChat(conversation.matchId, conversation.user)}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={conversation.user.photos?.[0]?.url || '/default-avatar.png'}
                      alt={conversation.user.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conversation.user.lastActiveAt && 
                     new Date() - new Date(conversation.user.lastActiveAt) < 5 * 60 * 1000 && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.user.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {conversation.lastMessageAt ? 
                          new Date(conversation.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                          : ''
                        }
                      </span>
                    </div>
                    
                    {conversation.lastMessage ? (
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {conversation.lastMessage.messageType === 'gift' 
                          ? `🎁 ${conversation.lastMessage.content}`
                          : conversation.lastMessage.content
                        }
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">Say hello! 👋</p>
                    )}
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

export default Messages;
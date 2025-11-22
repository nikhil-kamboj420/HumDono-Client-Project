// pages/Friends.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import Navigation from '../components/Navigation';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, sent
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const response = await api.getFriends();
        setFriends(response.friends || []);
      } else if (activeTab === 'requests') {
        const response = await api.getFriendRequests();
        setRequests(response.requests || []);
      } else if (activeTab === 'sent') {
        const response = await api.getSentFriendRequests();
        setSentRequests(response.sentRequests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await api.respondToFriendRequest(requestId, action);
      
      // If accepted, the backend should automatically send notification to the requester
      // The API response might include the friendship details
      
      fetchData(); // Refresh data
      
      if (action === 'accept') {
        showSuccess('Friend request accepted! They will be notified. 🎉', 'Request Accepted');
      } else {
        showSuccess('Friend request declined.', 'Request Declined');
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      showError('Failed to respond to friend request', 'Error');
    }
  };

  const removeFriend = async (friendshipId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await api.removeFriend(friendshipId);
      fetchData(); // Refresh data
      showSuccess('Friend removed successfully! 💔', 'Friend Removed');
    } catch (error) {
      console.error('Error removing friend:', error);
      showError('Failed to remove friend. Please try again.', 'Remove Failed');
    }
  };

  const renderFriends = () => (
    <div className="space-y-4">
      {friends.map((friendship) => (
        <div key={friendship.friendshipId} className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4">
            <img
              src={friendship.friend.photos?.[0]?.url || '/default-avatar.png'}
              alt={friendship.friend.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{friendship.friend.name}</h3>
              <p className="text-gray-600 text-sm">
                Friends since {new Date(friendship.since).toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-xs">
                {friendship.friend.lastActiveAt && 
                 new Date() - new Date(friendship.friend.lastActiveAt) < 5 * 60 * 1000 
                  ? 'Online now' 
                  : `Last seen ${new Date(friendship.friend.lastActiveAt).toLocaleDateString()}`
                }
              </p>
            </div>
            
            <button
              onClick={() => removeFriend(friendship.friendshipId)}
              className="text-red-500 hover:text-red-600 p-2"
            >
              <UserMinusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request._id} className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4">
            <img
              src={request.requester.photos?.[0]?.url || '/default-avatar.png'}
              alt={request.requester.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{request.requester.name}</h3>
              <p className="text-gray-600 text-sm">Age: {request.requester.age}</p>
              <p className="text-gray-600 text-sm">{request.requester.bio}</p>
              <p className="text-gray-400 text-xs">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => respondToRequest(request._id, 'accept')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(request._id, 'decline')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSentRequests = () => (
    <div className="space-y-4">
      {sentRequests.map((request) => (
        <div key={request._id} className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-4">
            <img
              src={request.recipient.photos?.[0]?.url || '/default-avatar.png'}
              alt={request.recipient.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{request.recipient.name}</h3>
              <p className="text-gray-600 text-sm">Age: {request.recipient.age}</p>
              <p className="text-gray-400 text-xs">
                Sent {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-yellow-600 text-sm font-medium">
              Pending
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
          <div className="flex items-center space-x-4 mb-4">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-12 w-12 object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'friends' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'requests' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'sent' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {activeTab === 'friends' && (
          friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No friends yet</h3>
              <p className="text-gray-600 mb-6">Start connecting with people to build your network!</p>
              <button
                onClick={() => navigate('/')}
                className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600"
              >
                Discover People
              </button>
            </div>
          ) : (
            renderFriends()
          )
        )}

        {activeTab === 'requests' && (
          requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No friend requests</h3>
              <p className="text-gray-600">You'll see friend requests here when people want to connect with you.</p>
            </div>
          ) : (
            renderRequests()
          )
        )}

        {activeTab === 'sent' && (
          sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent requests</h3>
              <p className="text-gray-600">Friend requests you send will appear here.</p>
            </div>
          ) : (
            renderSentRequests()
          )
        )}
      </div>

      <Navigation />

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

export default Friends;
// pages/FriendRequests.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.getFriendRequests();
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      await api.respondToFriendRequest(requestId, action);
      fetchRequests(); // Refresh requests
      alert(`Friend request ${action}ed successfully!`);
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to friend request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading friend requests...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Friend Requests</h1>
              <p className="text-gray-600 mt-1">{requests.length} pending requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No friend requests</h3>
            <p className="text-gray-600 mb-6">You'll see friend requests here when people want to connect with you.</p>
            <button
              onClick={() => navigate('/friends')}
              className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600"
            >
              View Friends
            </button>
          </div>
        ) : (
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
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 flex items-center space-x-1"
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      <span>Accept</span>
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
        )}
      </div>
    </div>
  );
};

export default FriendRequests;
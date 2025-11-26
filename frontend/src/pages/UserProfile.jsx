// pages/UserProfile.jsx - View other users' profiles
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  HeartIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import api from '../lib/api';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getUserProfile();
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Fetch the specific user's profile
      const response = await api.get('/users/' + id);
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.post('/interactions/like', { targetUserId: id });
      alert('Profile liked!');
    } catch (error) {
      console.error('Error liking profile:', error);
      alert('Failed to like profile');
    }
  };

  const handlePass = async () => {
    try {
      await api.post('/interactions/dislike', { targetUserId: id });
      navigate(-1);
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  const handleMessage = () => {
    // Check if female user
    if (currentUser?.gender?.toLowerCase() === 'female') {
      // Females can message directly
      navigate('/chat/direct_' + id, { state: { user, isDirectMessage: true } });
    } else {
      alert('You need to match first to send messages');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-pink-500 hover:text-pink-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-bold text-gray-900">{user.name}'s Profile</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Photo */}
        <div className="mb-6">
          <img
            src={user.photos?.[0]?.url || '/default-avatar.png'}
            alt={user.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Basic Info */}
        <div className="card-romantic p-6 mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
          {user.age && <p className="text-gray-600 text-lg mb-4">{user.age} years old</p>}
          
          {user.bio && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Photos */}
        {user.photos && user.photos.length > 1 && (
          <div className="card-romantic p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">More Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {user.photos.slice(1).map((photo, index) => (
                <img
                  key={photo.public_id}
                  src={photo.url}
                  alt={"Photo " + (index + 2)}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-pink-200 p-4">
          <div className="max-w-md mx-auto flex justify-center gap-4">
            <button
              onClick={handlePass}
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <XMarkIcon className="w-8 h-8 text-red-500" />
            </button>
            
            <button
              onClick={handleMessage}
              className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500" />
            </button>

            <button
              onClick={handleLike}
              className="w-14 h-14 bg-pink-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            >
              <HeartSolid className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

// components/FemaleProfilePopup.jsx
import { XMarkIcon, HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

export default function FemaleProfilePopup({ profile, onClose, onInteract }) {
  const navigate = useNavigate();

  const handleInteraction = (action) => {
    // Redirect to subscription page on any interaction
    onInteract();
    navigate('/subscription?required=true');
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Profile Image */}
        <div className="relative h-64 bg-gradient-to-br from-pink-200 to-purple-200">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              👩
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
            <p className="text-sm opacity-90">{profile.location}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-4">
            {profile.message || `${profile.name} is interested in connecting with you! 💕`}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleInteraction('like')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <HeartIcon className="w-5 h-5" />
              Like
            </button>
            <button
              onClick={() => handleInteraction('message')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              Message
            </button>
          </div>

          {/* Subscription Hint */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Subscribe to unlock unlimited interactions 🔓
          </p>
        </div>
      </div>
    </div>
  );
}

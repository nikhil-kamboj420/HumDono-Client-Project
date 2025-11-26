// components/ProfileModal.jsx
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function ProfileModal({ profile, isOpen, onClose, onLike, onDislike }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const photo = profile.photos?.[0]?.url || '/placeholder.png';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] profile-scroll">
          {/* Profile Image */}
          <div className="relative w-full h-96 bg-gray-100">
            <img
              src={photo}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Name & Age Overlay */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-3xl font-bold">
                {profile.name}{profile.age ? `, ${profile.age}` : ''}
              </h2>
              {profile.location?.city && (
                <p className="text-lg opacity-90">{profile.location.city}</p>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {profile.education && (
                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium text-gray-900">{profile.education}</p>
                </div>
              )}
              {(profile.profession || profile.occupation) && (
                <div>
                  <p className="text-sm text-gray-500">Profession</p>
                  <p className="font-medium text-gray-900">{profile.profession || profile.occupation}</p>
                </div>
              )}
              {profile.relationshipStatus && (
                <div>
                  <p className="text-sm text-gray-500">Relationship Status</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.relationshipStatus}</p>
                </div>
              )}
              {profile.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.gender}</p>
                </div>
              )}
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle */}
            {(profile.drinking || profile.smoking || profile.eating) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
                <div className="space-y-3">
                  {profile.drinking && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🍷</span>
                        <span className="text-gray-700">Drinking</span>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{profile.drinking}</span>
                    </div>
                  )}
                  {profile.smoking && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🚭</span>
                        <span className="text-gray-700">Smoking</span>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{profile.smoking}</span>
                    </div>
                  )}
                  {profile.eating && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="text-gray-700">Diet</span>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{profile.eating}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* More Photos */}
            {profile.photos && profile.photos.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">More Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {profile.photos.slice(1, 5).map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
                {profile.photos.length > 5 && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    +{profile.photos.length - 5} more photos
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          {(onLike || onDislike) && (
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              {onDislike && (
                <button
                  onClick={() => {
                    onDislike();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
              )}
              {onLike && (
                <button
                  onClick={() => {
                    onLike();
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all"
                >
                  Like ❤️
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

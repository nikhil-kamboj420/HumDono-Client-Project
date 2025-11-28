// pages/Profile.jsx - Improved layout with proper scrolling in 100vh
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CameraIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';
import Navigation from '../components/Navigation';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUserProfile();
      setUser(response.user);
      setFormData({
        name: response.user.name || '',
        age: response.user.age || '',
        bio: response.user.bio || '',
        relationshipStatus: response.user.relationshipStatus || 'single',
        gender: response.user.gender || '',
        occupation: response.user.occupation || '',
        education: response.user.education || '',
        interests: response.user.interests?.join(', ') || '',
        visibilitySettings: response.user.visibilitySettings || { showAge: true }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData,
        interests: formData.interests
          .split(',')
          .map(i => i.trim())
          .filter(Boolean)
      };
      
      await api.updateProfile(updateData);
      await fetchUserProfile();
      setEditing(false);
      alert('Profile updated! ✅');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('photo', file);

    setUploading(true);
    try {
      const response = await api.uploadPhoto(formDataObj, true);
      setUser(response.user);
      alert('Photo uploaded! ✅');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async (publicId) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await api.deletePhoto(publicId);
      await fetchUserProfile();
      alert('Photo deleted! ✅');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    // 🔹 FULL SCREEN + FLEX COLUMN
    <div className="min-h-screen bg-sunset-gradient flex flex-col lg:pr-64">
      {/* Header (fixed height top area) */}
      <div className="bg-white/10 backdrop-blur-sm shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-white/80"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-pink-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-pink-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    fetchUserProfile();
                  }}
                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 sm:px-4 py-2 bg-pink-500 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-pink-600"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 SCROLLABLE CONTENT AREA (between header & bottom nav) */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Photos Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              Photos
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {user?.photos?.map((photo, index) => (
                <div
                  key={photo.public_id}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.isProfile && (
                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                      Profile
                    </div>
                  )}
                  {editing && (
                    <button
                      onClick={() => handlePhotoDelete(photo.public_id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              {editing && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-colors">
                  <CameraIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              Basic Info
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, age: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900">{user?.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {editing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{user?.gender}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">
                  {user?.bio || 'No bio added'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Status
              </label>
              {editing ? (
                <select
                  value={formData.relationshipStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relationshipStatus: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">
                  {user?.relationshipStatus}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      education: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">
                  {user?.education || 'Not added'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">
                  {user?.occupation || 'Not added'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests (comma separated)
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      interests: e.target.value,
                    }))
                  }
                  placeholder="Music, Travel, Cooking"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              Privacy Settings
            </h2>

            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show my age</span>
              <input
                type="checkbox"
                checked={formData.visibilitySettings?.showAge !== false}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    visibilitySettings: {
                      ...prev.visibilitySettings,
                      showAge: checked,
                    },
                  }));
                  if (!editing) {
                    try {
                      await api.updateProfile({
                        visibilitySettings: {
                          ...formData.visibilitySettings,
                          showAge: checked,
                        },
                      });
                      const refreshed = await api.getUserProfile();
                      setUser(refreshed.user);
                    } catch (err) {
                      console.error('Failed to update visibility setting:', err);
                      alert('Failed to update visibility setting');
                    }
                  }
                }}
                className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 🔹 Bottom navigation (stays at bottom of screen) */}
      <Navigation />
    </div>
  );
};

export default Profile;

// pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CameraIcon,
  LinkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
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
        socialLinks: response.user.socialLinks || {},
        visibilitySettings: response.user.visibilitySettings || {}
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
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };
      
      await api.updateProfile(updateData);
      setUser(prev => ({ ...prev, ...updateData }));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.uploadPhoto(formData, true);
      setUser(response.user);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
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

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
            >
              <PencilIcon className="w-4 h-4" />
              <span>{editing ? 'Save' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Profile Photos */}
        <div className="card-romantic p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {user?.photos?.map((photo, index) => (
              <div key={photo.public_id} className="relative">
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                {photo.isProfile && (
                  <div className="absolute top-1 left-1 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Photo Button */}
            <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <CameraIcon className="w-8 h-8 text-gray-400" />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card-romantic p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{user?.name || 'Not set'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900">{user?.age || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {editing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{user?.gender || 'Not set'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Tell people about yourself..."
                />
              ) : (
                <p className="text-gray-900">{user?.bio || 'No bio added'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Status</label>
              {editing ? (
                <select
                  value={formData.relationshipStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationshipStatus: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="complicated">It's Complicated</option>
                </select>
              ) : (
                <p className="text-gray-900 capitalize">{user?.relationshipStatus || 'Single'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="Music, Travel, Sports (comma separated)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((interest, index) => (
                    <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  )) || <p className="text-gray-500">No interests added</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card-romantic p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LinkIcon className="w-5 h-5 mr-2" />
            Social Links
          </h3>
          
          <div className="space-y-4">
            {['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {platform}
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={formData.socialLinks?.[platform] || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
                    }))}
                    placeholder={`Your ${platform} profile URL`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user?.socialLinks?.[platform] || 'Not added'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <EyeIcon className="w-5 h-5 mr-2" />
            Privacy Settings
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show my age</span>
              <input
                type="checkbox"
                checked={formData.visibilitySettings?.showAge !== false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  visibilitySettings: { ...prev.visibilitySettings, showAge: e.target.checked }
                }))}
                disabled={!editing}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show social links to matches</span>
              <input
                type="checkbox"
                checked={formData.visibilitySettings?.showSocialLinks || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  visibilitySettings: { ...prev.visibilitySettings, showSocialLinks: e.target.checked }
                }))}
                disabled={!editing}
                className="rounded"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
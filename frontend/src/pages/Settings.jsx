// pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  EyeIcon,
  UserIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import api from '../lib/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    lookingFor: {
      gender: 'any',
      minAge: 18,
      maxAge: 60
    },
    notifications: {
      matches: true,
      messages: true,
      likes: true,
      marketing: false
    },
    privacy: {
      showAge: true,
      showSocialLinks: false,
      showDistance: true
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.getUserProfile();
      const userData = response.user;
      setUser(userData);
      
      setPreferences({
        lookingFor: userData.lookingFor || preferences.lookingFor,
        notifications: userData.notifications || preferences.notifications,
        privacy: userData.visibilitySettings || preferences.privacy
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (section, updates) => {
    try {
      const updateData = {
        [section]: { ...preferences[section], ...updates }
      };
      
      await api.updateProfile(updateData);
      setPreferences(prev => ({
        ...prev,
        [section]: { ...prev[section], ...updates }
      }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update settings');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Account Info */}
        <div className="card-romantic p-6">
          <div className="flex items-center space-x-4 mb-4">
            <UserIcon className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Account</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Name</span>
              <span className="text-gray-900 font-medium">{user?.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Phone</span>
              <span className="text-gray-900 font-medium">{user?.getMaskedPhone?.() || user?.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Coins</span>
              <span className="text-yellow-600 font-bold">{user?.coins || 0}</span>
            </div>
          </div>
        </div>

        {/* Dating Preferences */}
        <div className="card-romantic p-6">
          <div className="flex items-center space-x-4 mb-4">
            <HeartIcon className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-gray-900">Dating Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Looking for
              </label>
              <select
                value={preferences.lookingFor.gender}
                onChange={(e) => updatePreferences('lookingFor', { gender: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="any">Anyone</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range: {preferences.lookingFor.minAge} - {preferences.lookingFor.maxAge}
              </label>
              <div className="flex space-x-4">
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={preferences.lookingFor.minAge}
                  onChange={(e) => updatePreferences('lookingFor', { minAge: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={preferences.lookingFor.maxAge}
                  onChange={(e) => updatePreferences('lookingFor', { maxAge: parseInt(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card-romantic p-6">
          <div className="flex items-center space-x-4 mb-4">
            <EyeIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show my age</span>
              <input
                type="checkbox"
                checked={preferences.privacy.showAge}
                onChange={(e) => updatePreferences('privacy', { showAge: e.target.checked })}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show social links to matches</span>
              <input
                type="checkbox"
                checked={preferences.privacy.showSocialLinks}
                onChange={(e) => updatePreferences('privacy', { showSocialLinks: e.target.checked })}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Show distance</span>
              <input
                type="checkbox"
                checked={preferences.privacy.showDistance}
                onChange={(e) => updatePreferences('privacy', { showDistance: e.target.checked })}
                className="rounded"
              />
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-romantic p-6">
          <div className="flex items-center space-x-4 mb-4">
            <BellIcon className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700">New matches</span>
              <input
                type="checkbox"
                checked={preferences.notifications.matches}
                onChange={(e) => updatePreferences('notifications', { matches: e.target.checked })}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">New messages</span>
              <input
                type="checkbox"
                checked={preferences.notifications.messages}
                onChange={(e) => updatePreferences('notifications', { messages: e.target.checked })}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Someone likes you</span>
              <input
                type="checkbox"
                checked={preferences.notifications.likes}
                onChange={(e) => updatePreferences('notifications', { likes: e.target.checked })}
                className="rounded"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-gray-700">Marketing emails</span>
              <input
                type="checkbox"
                checked={preferences.notifications.marketing}
                onChange={(e) => updatePreferences('notifications', { marketing: e.target.checked })}
                className="rounded"
              />
            </label>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Edit Profile</span>
              <span className="text-gray-400">→</span>
            </button>
            
            {/* Buy Coins - Only for Male Users */}
            {user?.gender?.toLowerCase() !== 'female' && (
              <button
                onClick={() => navigate('/wallet')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Buy Coins</span>
                <span className="text-gray-400">→</span>
              </button>
            )}
            
            <button
              onClick={() => navigate('/referrals')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
            >
              <span>Invite Friends</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-romantic p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Account Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
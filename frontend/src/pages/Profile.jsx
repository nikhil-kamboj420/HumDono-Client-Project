// pages/Profile.jsx - Redesigned with better mobile UX
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  CameraIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import api from "../lib/api";
import Navigation from "../components/Navigation";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [passKey, setPassKey] = useState('');
  const [activating, setActivating] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [applyingReferral, setApplyingReferral] = useState(false);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } = useCustomAlert();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getUserProfile();
      setUser(response.user);
      setFormData({
        name: response.user.name || "",
        age: response.user.age || "",
        bio: response.user.bio || "",
        relationshipStatus: response.user.relationshipStatus || "single",
        gender: response.user.gender || "",
        occupation: response.user.occupation || "",
        education: response.user.education || "",
        interests: response.user.interests?.join(", ") || "",
        visibilitySettings: response.user.visibilitySettings || {
          showAge: true,
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...formData,
        interests: formData.interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };

      await api.updateProfile(updateData);
      await fetchUserProfile();
      setEditing(false);
      showSuccess("Profile updated successfully! ✅");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile. Please try again.");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append("photo", file);

    setUploading(true);
    try {
      const response = await api.uploadPhoto(formDataObj, true);
      setUser(response.user);
      showSuccess("Photo uploaded successfully! ✅");
    } catch (error) {
      console.error("Error uploading photo:", error);
      showError("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetProfilePhoto = async (publicId) => {
    try {
      await api.setProfilePhoto(publicId);
      await fetchUserProfile();
      showSuccess("Profile picture updated! ✅");
    } catch (error) {
      console.error("Error setting profile photo:", error);
      showError("Failed to set profile photo. Please try again.");
    }
  };

  const confirmDeletePhoto = async () => {
    try {
      await api.deletePhoto(photoToDelete);
      await fetchUserProfile();
      setPhotoToDelete(null);
      showSuccess("Photo deleted successfully! ✅");
    } catch (error) {
      console.error("Error deleting photo:", error);
      showError("Failed to delete photo. Please try again.");
    }
  };

  const handleActivatePassKey = async () => {
    if (!passKey.trim()) {
      showError("Please enter a pass key", "Invalid Input");
      return;
    }

    setActivating(true);
    try {
      const response = await api.post('/subscription/activate-passkey', { passKey });

      if (response.success) {
        showSuccess(response.message, 'Success');
        setPassKey('');
        await fetchUserProfile();
      }
    } catch (error) {
      showError(
        error.response?.data?.message || 'Invalid pass key',
        'Activation Failed'
      );
    } finally {
      setActivating(false);
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) {
      showError("Please enter a referral code", "Invalid Input");
      return;
    }

    setApplyingReferral(true);
    try {
      const response = await api.post('/referrals/apply-code', { referralCode });

      if (response.ok) {
        showSuccess(
          `🎉 ${response.message}! You now have ${response.totalCoins} coins!`,
          'Referral Applied'
        );
        setReferralCode('');
        await fetchUserProfile();
      }
    } catch (error) {
      showError(
        error.response?.data?.error || 'Invalid referral code or already used',
        'Application Failed'
      );
    } finally {
      setApplyingReferral(false);
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
    <div className="min-h-screen bg-sunset-gradient flex flex-col lg:pr-64">
      {/* Fixed Header */}
      <div className="bg-white/10 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-white/80"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white">My Profile</h2>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    fetchUserProfile();
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Photos Section - Improved */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
              {editing && (
                <p className="text-sm text-gray-500">
                  Tap ✓ to set profile photo
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {user?.photos?.map((photo, index) => (
                <div
                  key={photo.public_id}
                  className="relative aspect-square rounded-xl overflow-hidden border-4 transition-all"
                  style={{
                    borderColor: photo.isProfile ? "#ec4899" : "transparent",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Profile Badge */}
                  {photo.isProfile && (
                    <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
                      <CheckCircleIconSolid className="w-4 h-4" />
                      Profile
                    </div>
                  )}

                  {/* Edit Mode Actions */}
                  {editing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-100 transition-opacity">
                      {!photo.isProfile && (
                        <button
                          onClick={() => handleSetProfilePhoto(photo.public_id)}
                          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 shadow-lg transform hover:scale-110 transition-transform"
                          title="Set as profile picture"
                        >
                          <CheckCircleIcon className="w-6 h-6" />
                        </button>
                      )}
                      <button
                        onClick={() => setPhotoToDelete(photo.public_id)}
                        className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-transform"
                        title="Delete photo"
                      >
                        <TrashIcon className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              {editing && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  ) : (
                    <>
                      <CameraIcon className="w-10 h-10 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2 font-medium">
                        Add Photo
                      </span>
                    </>
                  )}
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
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Basic Info
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 text-lg">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              {editing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, age: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 text-lg">{user?.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">{user?.bio || "No bio added"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g. Bachelor's in Computer Science"
                />
              ) : (
                <p className="text-gray-900">
                  {user?.education || "Not added"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g. Software Engineer"
                />
              ) : (
                <p className="text-gray-900">
                  {user?.occupation || "Not added"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.length > 0 ? (
                    user.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests added</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              Privacy Settings
            </h2>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-gray-700 font-medium">Show my age</span>
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
                      console.error(
                        "Failed to update visibility setting:",
                        err
                      );
                      showError("Failed to update visibility setting. Please try again.");
                    }
                  }
                }}
                className="w-6 h-6 rounded text-pink-600 focus:ring-pink-500"
              />
            </label>
          </div>

          {/* Pass Key Activation Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              🎁 Activate Pass Key
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Have a pass key? Enter it below to unlock premium features or coins!
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter your pass key"
                value={passKey}
                onChange={(e) => setPassKey(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg"
              />
              <button
                onClick={handleActivatePassKey}
                disabled={activating || !passKey}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {activating ? 'Activating...' : 'Activate Pass Key'}
              </button>
            </div>

            <div className="mt-4 bg-white/50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-gray-600 text-center">
                After making a payment, enter the pass key to activate your rewards
              </p>
            </div>
          </div>

          {/* Apply Referral Code Section - Only show if user hasn't used a referral code yet */}
          {!user?.referredBy && (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                🎁 Apply Referral Code
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Have a friend's referral code? Enter it to earn bonus coins for both of you!
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg"
                />
                <button
                  onClick={handleApplyReferralCode}
                  disabled={applyingReferral || !referralCode}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {applyingReferral ? 'Applying...' : 'Apply Referral Code'}
                </button>
              </div>

              <div className="mt-4 bg-white/50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-gray-600 text-center">
                  💰 You'll earn 50 coins and your friend will earn 100 coins!
                </p>
              </div>
            </div>
          )}

          {/* Show if user has already used a referral */}
          {user?.referredBy && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                ✅ Referral Code Applied
              </h2>
              <p className="text-gray-600 text-sm">
                You have already used a referral code. You can only use one referral code per account.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Save Button (shown when editing) */}
      {editing && (
        <div className="fixed bottom-20 left-0 right-0 lg:right-64 p-4 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Success/Error Alerts */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />

      {/* Delete Photo Confirmation */}
      <CustomAlert
        isOpen={!!photoToDelete}
        type="warning"
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        showCancel={true}
        onConfirm={confirmDeletePhoto}
        onCancel={() => setPhotoToDelete(null)}
      />
    </div>
  );
};

export default Profile;

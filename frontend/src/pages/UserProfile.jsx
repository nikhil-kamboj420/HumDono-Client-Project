// pages/UserProfile.jsx - View other users' profiles
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import api from "../lib/api";
import SwipeCard from "../components/SwipeCard";

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
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Fetch the specific user's profile
      const response = await api.get("/users/" + id);
      setUser(response.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.postInteraction({ to: id, action: "like" });
      navigate(-1);
    } catch (error) {
      console.error("Error liking profile:", error);
    }
  };

  const handlePass = async () => {
    try {
      await api.postInteraction({ to: id, action: "dislike" });
      navigate(-1);
    } catch (error) {
      console.error("Error passing profile:", error);
    }
  };

  const handleMessage = async () => {
    try {
      // Check if there's already a match/conversation with this user
      const conversations = await api.getConversations();
      const existingMatch = conversations.conversations?.find(
        (conv) => conv.otherUser?._id === id
      );

      if (existingMatch) {
        // Navigate to existing chat
        navigate(`/chat/${existingMatch._id}`, {
          state: { user: user },
        });
      } else {
        // Allow direct messaging for all users (creates match automatically/handles payment)
        navigate(`/chat/direct_${id}`, {
          state: { user: user, isDirectMessage: true },
        });
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      alert("Failed to open chat. Please try again.");
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            User not found
          </h2>
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
    <div className="min-h-screen bg-sunset-gradient pb-0 lg:pb-0 lg:pr-64">
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="ml-4 text-2xl font-bold text-gray-900">Profile</h2>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {user && (
          <SwipeCard
            profile={user}
            currentUser={currentUser}
            onLike={() => handleLike()}
            onDislike={() => handlePass()}
            onMessage={handleMessage}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;

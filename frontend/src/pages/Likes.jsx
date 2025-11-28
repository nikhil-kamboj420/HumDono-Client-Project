// frontend/src/pages/Likes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { getLikedUsers, removeInteraction } from "../lib/api";
import Navigation from "../components/Navigation";

export default function Likes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedUsers();
  }, []);

  const fetchLikedUsers = async () => {
    try {
      const response = await getLikedUsers();
      setLikedUsers(response.likedUsers || []);
    } catch (error) {
      console.error("Error fetching liked users:", error);
      setLikedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (userId) => {
    try {
      const response = await removeInteraction(userId);
      if (response.ok) {
        // Remove from list
        setLikedUsers((prev) =>
          prev.filter((item) => item.user._id !== userId)
        );
        // Invalidate feed query
        await qc.invalidateQueries({ queryKey: ["feed"] });
        // Stay on same page - profile will appear in feed when user goes back
      }
    } catch (error) {
      console.error("Error undoing like:", error);
      alert("Failed to undo. Please try again.");
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
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-white/80"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">People I Like ❤️</h1>
        </div>

        {/* List */}
        {likedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-white text-lg">You haven't liked anyone yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {likedUsers.map(({ user, action }) => (
              <div
                key={user._id}
                className="bg-white rounded-xl p-4 shadow-lg flex gap-4"
              >
                <img
                  src={user.photos?.[0]?.url || "/placeholder.png"}
                  alt={user.name}
                  className="w-20 h-20 rounded-lg object-cover cursor-pointer"
                  onClick={() => navigate(`/profile/${user._id}`)}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {user.name}, {user.age}
                  </h3>
                  <p className="text-sm text-gray-600">{user.location?.city}</p>
                  {action === "superlike" && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Super Like 💫
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleUndo(user._id)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors self-center min-w-[70px]"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}

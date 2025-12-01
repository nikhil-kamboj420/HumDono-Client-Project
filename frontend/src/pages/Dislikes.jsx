// frontend/src/pages/Dislikes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { getDislikedUsers, removeInteraction } from "../lib/api";
import Navigation from "../components/Navigation";

export default function Dislikes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDislikedUsers();
  }, []);

  const fetchDislikedUsers = async () => {
    try {
      // Fetch with high limit to get all disliked profiles in one request
      const response = await getDislikedUsers({ limit: 1000 });
      setDislikedUsers(response.dislikedUsers || []);
    } catch (error) {
      console.error("Error fetching disliked users:", error);
      setDislikedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (userId) => {
    try {
      const response = await removeInteraction(userId);
      if (response.ok) {
        // Remove from list
        setDislikedUsers((prev) =>
          prev.filter((item) => item.user._id !== userId)
        );
        // Invalidate feed query to show profile again
        await qc.invalidateQueries({ queryKey: ["feed"] });
        // Show the user's profile on SwipeCard
        navigate(`/profile/${userId}`);
      }
    } catch (error) {
      console.error("Error undoing dislike:", error);
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
          <h2 className="text-2xl font-bold text-white">People I Disliked 👎</h2>
        </div>

        {/* List */}
        {dislikedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-white text-lg">You haven't skipped anyone yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dislikedUsers.map(({ user }) => (
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
                  <h3 className="text-black font-semibold text-lg">
                    {user.name}, {user.age}
                  </h3>
                  {/* location hidden per requirement */}
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

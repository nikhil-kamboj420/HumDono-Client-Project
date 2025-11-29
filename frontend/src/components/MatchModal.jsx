import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useCustomAlert } from "../hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

/**
 * MatchModal
 * Props:
 *  - open (bool)
 *  - matchId (string)
 *  - matchedUser ({ _id, name, age, photos, phone, isMatched })
 *  - onClose()
 */
export default function MatchModal({ open, matchId, matchedUser, onClose }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { alertConfig, showSuccess, showError, showConfirm, hideAlert } = useCustomAlert();

  if (!open) return null;

  const photo = (matchedUser?.photos && matchedUser.photos[0]?.url) || "/placeholder.png";

  const handleOpenChat = async () => {
    try {
      setLoading(true);
      const res = await api.openMatchChat(matchId);
      // success -> navigate to chat
      showSuccess("Chat opened! You can now message. 💬", "Chat Ready");
      setTimeout(() => {
        navigate(`/chat/${matchId}`, { state: { user: matchedUser } });
        onClose();
      }, 1500);
    } catch (err) {
      // if 402 -> show buy flow
      if (err?.response?.status === 402) {
        const data = err.response.data || {};
        const needed = data.needed ?? data.required ?? 5;
        showConfirm(
          `You need ${needed} more coins to open chat. Buy coins now? 💰`,
          () => navigate('/wallet'),
          "Insufficient Coins"
        );
      } else {
        showError(err?.response?.data?.error || "Failed to open chat. Please try again.", "Chat Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-lg">
        {/* Match Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-pink-600 mb-1">It's a Match!</h2>
          <p className="text-gray-600 text-sm">You both liked each other</p>
        </div>

        {/* Matched User Info */}
        <div className="flex items-center gap-4 mb-6 bg-pink-50 p-4 rounded-xl">
          <img src={photo} alt="match" className="w-20 h-20 object-cover rounded-full border-4 border-pink-200" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {matchedUser?.name}{matchedUser?.age ? `, ${matchedUser.age}` : ""}
            </h3>
            <p className="text-sm text-gray-500">Start chatting now!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleOpenChat}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg"
          >
            {loading ? "Opening..." : "Start Chatting 💬"}
          </button>

          <button
            onClick={handleOpenChat}
            disabled={loading}
            className="w-full py-3 rounded-xl border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition-all"
          >
            {loading ? "Opening..." : "Let's Chat 💕"}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
          >
            Maybe Later
          </button>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
}

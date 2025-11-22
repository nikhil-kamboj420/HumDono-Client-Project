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

  const handleViewPhone = () => {
    if (matchedUser?.phone) {
      alert(`Phone: ${matchedUser.phone}`);
    } else {
      alert("Phone not available.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <img src={photo} alt="match" className="w-16 h-16 object-cover rounded-lg" />
          <div>
            <h3 className="text-lg font-bold">{matchedUser?.name}{matchedUser?.age ? `, ${matchedUser.age}` : ""}</h3>
            <div className="text-sm text-gray-500">It's a match 🎉</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button
            onClick={handleOpenChat}
            disabled={loading}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-[#cc0033] to-[#ff1971] text-white font-semibold"
          >
            {loading ? "Opening..." : "Open Chat (costs coins if no subscription)"}
          </button>

          <button
            onClick={handleViewPhone}
            className="w-full py-2 rounded-xl border text-[#cc0033] font-medium"
          >
            View Phone
          </button>

          <button onClick={onClose} className="w-full py-2 rounded-xl bg-gray-100 text-gray-700">
            Close
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

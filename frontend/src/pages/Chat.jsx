// pages/Chat.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  PaperAirplaneIcon,
  GiftIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import api from "../lib/api";
import CustomAlert from "../components/CustomAlert";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { io } from "socket.io-client";

const Chat = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(" ");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [gifts, setGifts] = useState([]);
  const messagesEndRef = useRef(null);
  const { alertConfig, showSuccess, showError, showWarning, hideAlert } =
    useCustomAlert();

  const user = location.state?.user;
  const isDirectMessage =
    location.state?.isDirectMessage || matchId?.startsWith("direct_");
  const targetUserId = isDirectMessage ? matchId?.replace("direct_", "") : null;

  useEffect(() => {
    if (matchId && !isDirectMessage) {
      fetchMessages();
      fetchGifts();
    } else if (isDirectMessage) {
      // For direct messages, just fetch gifts (no messages yet)
      fetchGifts();
      setLoading(false);
    }
  }, [matchId, isDirectMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io for real-time messages
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { withCredentials: true });

    // Join user's personal room
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (currentUser?._id) {
        socket.emit("user:join", currentUser._id);
      }
    } catch (err) {
      console.error("Failed to join socket room:", err);
    }

    // Listen for new messages
    socket.on("message:new", (data) => {
      const { message, matchId: incomingMatchId } = data;

      // Only add message if it belongs to the current chat
      if (String(incomingMatchId) === String(matchId)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [matchId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      if (isDirectMessage) {
        // No messages yet for direct message
        setMessages([]);
        return;
      }
      const response = await api.get(`/messages/${matchId}`);
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await api.get("/gifts");
      setGifts(response.gifts || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      let response;

      if (isDirectMessage && targetUserId) {
        // Send direct message (females only)
        response = await api.sendDirectMessage(targetUserId, newMessage.trim());

        // After first message, navigate to the actual match chat
        if (response.matchId) {
          navigate(`/chat/${response.matchId}`, {
            state: { user },
            replace: true,
          });
          return;
        }
      } else {
        // Regular message
        response = await api.sendMessage(matchId, newMessage.trim());
      }

      setMessages((prev) => [...prev, response.message]);
      setNewMessage(" ");

      // Show coins deduction notification if applicable
      if (response.coinsDeducted > 0) {
        showSuccess(
          `Message sent! ${response.coinsDeducted} coins deducted. Remaining: ${response.remainingCoins} coins 💰`,
          "Message Sent"
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      if (
        error.response?.status === 403 &&
        error.response?.data?.requiresSubscription
      ) {
        const errorData = error.response.data;
        showError(
          errorData.error ||
          `You've used your free messages. Subscribe to continue messaging! 💕`,
          "Subscription Required"
        );
        setTimeout(() => navigate("/subscription?required=true"), 2000);
      } else if (error.response?.status === 402) {
        const errorData = error.response.data;
        showError(
          `Insufficient coins! You need ${errorData.coinsRequired} coins to send messages. Current balance: ${errorData.currentCoins} coins. Please buy more coins or get a subscription. 💳`,
          "Insufficient Coins"
        );
        setTimeout(() => navigate("/wallet"), 2000);
      } else {
        showError(
          "Failed to send message. Please try again.",
          "Message Failed"
        );
      }
    } finally {
      setSending(false);
    }
  };

  const sendGift = async (gift) => {
    try {
      await api.post("/gifts/send", {
        giftId: gift._id,
        receiverId: user._id,
        matchId: matchId,
        message: `Sent you a ${gift.name}!`,
      });

      // Refresh messages to show the gift
      fetchMessages();
      setShowGifts(false);

      // Show success notification with sound
      showSuccess(
        `${gift.name} sent successfully! 🎁 They'll love it!`,
        "Gift Sent"
      );
    } catch (error) {
      console.error("Error sending gift:", error);

      if (error.response?.data?.error === "Insufficient coins") {
        showError(
          `You need ${error.response.data.required} coins to send this gift. You have ${error.response.data.balance} coins. 💰`,
          "Insufficient Coins"
        );
      } else {
        showError("Failed to send gift. Please try again.", "Gift Failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-sunset-gradient">
      {/* Header - Fixed */}
      <div className="bg-white/10 backdrop-blur-sm shadow-romantic border-b border-pink-200 shrink-0">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>

          <div
            className="flex items-center space-x-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => user?._id && navigate(`/profile/${user._id}`)}
          >
            <img
              src={user?.photos?.[0]?.url || "/default-avatar.png"}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
            />

            <div className="flex-1">
              <h3 className="font-semibold  text-gray-900">{user?.name}</h3>
              <p className="text-xs text-gray-500">
                {user?.lastActiveAt &&
                  new Date() - new Date(user.lastActiveAt) < 5 * 60 * 1000
                  ? "🟢 Online"
                  : "Last seen recently"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === user?._id
                ? "justify-start"
                : "justify-end"
                }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.sender._id === user?._id
                  ? "bg-gray-200 text-gray-900"
                  : "bg-pink-500 text-white"
                  }`}
              >
                {message.messageType === "gift" ? (
                  <div className="text-center">
                    <div className="text-3xl mb-1">
                      {message.gift?.emoji || "🎁"}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.gift?.value && (
                      <p className="text-xs opacity-75">
                        {message.gift.value} 🪙
                      </p>
                    )}
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <p
                  className={`text-xs mt-1 ${message.sender._id === user?._id
                    ? "text-gray-500"
                    : "text-pink-100"
                    }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Gift Selector */}
      {showGifts && (
        <div className="bg-white/10 backdrop-blur-sm border-t border-pink-200 p-4 max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Send a Gift</h3>
            <button
              onClick={() => setShowGifts(false)}
              className="text-gray-500"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gifts.map((gift) => (
              <button
                key={gift._id}
                onClick={() => sendGift(gift)}
                className="flex flex-col items-center p-3 border border-pink-200 rounded-xl hover:bg-pink-50 hover:border-pink-400 transition-all shadow-sm"
              >
                <div className="text-3xl mb-1">{gift.emoji || "🎁"}</div>
                <p className="text-xs font-medium text-gray-700">{gift.name}</p>
                <p className="text-xs text-pink-600 font-semibold">
                  {gift.coinValue} 🪙
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input - Fixed at bottom */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-pink-200 p-4 max-w-md mx-auto w-full shrink-0">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowGifts(!showGifts)}
            className="text-pink-500 hover:text-pink-600"
          >
            <GiftIcon className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className=" flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-pink-500 bg-[#fff6f6]"
            disabled={sending}
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-romantic-gradient text-white p-2 rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
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
};

export default Chat;

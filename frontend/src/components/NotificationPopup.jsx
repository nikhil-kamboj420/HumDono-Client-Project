// components/NotificationPopup.jsx
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  HeartIcon,
  UserPlusIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { playNotificationSound } from "../utils/notificationSound";

export default function NotificationPopup({ notification, onClose, onAction }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      onClose();
    }, 300);
  };

  const handleAction = (action) => {
    onAction(action, notification);
    handleClose();
  };

  useEffect(() => {
    if (notification && isVisible) {
      playNotificationSound(notification.type);
    }
  }, [notification, isVisible]);

  if (!notification || !isVisible) return null;

  const getNotificationContent = () => {
    const { type, fromUser, data } = notification;
    const userName = fromUser?.name || "Someone";
    const userPhoto = fromUser?.photos?.[0]?.url;

    switch (type) {
      case "like":
        return {
          icon: <HeartSolid className="w-6 h-6 text-red-500" />,
          title: "New Like! 💕",
          message: `${userName} liked your profile`,
          actions: [
            { label: "View Profile", action: "view_profile", primary: true },
            { label: "Like Back", action: "like_back", secondary: true },
          ],
        };

      case "friend_request":
        return {
          icon: <UserPlusIcon className="w-6 h-6 text-blue-500" />,
          title: "Friend Request! 👋",
          message: `${userName} wants to be friends`,
          actions: [
            { label: "Accept", action: "accept_friend", primary: true },
            { label: "View Profile", action: "view_profile", secondary: true },
          ],
        };

      case "friend_accepted":
        return {
          icon: <CheckIcon className="w-6 h-6 text-green-500" />,
          title: "Friend Request Accepted! 🎉",
          message: `${userName} accepted your friend request`,
          actions: [
            { label: "Send Message", action: "send_message", primary: true },
            { label: "View Profile", action: "view_profile", secondary: true },
          ],
        };

      case "match":
        return {
          icon: <HeartSolid className="w-6 h-6 text-pink-500" />,
          title: "It's a Match! 🎉",
          message: `You and ${userName} liked each other`,
          actions: [
            { label: "Send Message", action: "send_message", primary: true },
            { label: "View Profile", action: "view_profile", secondary: true },
          ],
        };

      case "message":
        return {
          icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500" />,
          title: "New Message! 💬",
          message: `${userName} sent you a message`,
          actions: [
            { label: "Reply", action: "reply_message", primary: true },
            { label: "View Chat", action: "view_chat", secondary: true },
          ],
        };

      case "gift":
        return {
          icon: <GiftIcon className="w-6 h-6 text-purple-500" />,
          title: "Gift Received! 🎁",
          message: `${userName} sent you a ${data?.giftName || "gift"}`,
          actions: [
            { label: "Say Thanks", action: "send_message", primary: true },
            { label: "View Gift", action: "view_chat", secondary: true },
          ],
        };

      default:
        return {
          icon: <HeartIcon className="w-6 h-6 text-gray-500" />,
          title: "New Notification",
          message: "You have a new notification",
          actions: [{ label: "View", action: "view", primary: true }],
        };
    }
  };

  const content = getNotificationContent();

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 ${
          isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="bg-romantic-gradient px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            {content.icon}
            <span className="font-semibold text-sm">{content.title}</span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            {notification.fromUser && (
              <div className="flex-shrink-0">
                {notification.fromUser.photos?.[0]?.url ? (
                  <img
                    src={notification.fromUser.photos[0].url}
                    alt={notification.fromUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {notification.fromUser.name?.[0] || "?"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm">
                {content.message}
              </p>
              <p className="text-gray-500 text-xs mt-1">Just now</p>
            </div>
          </div>

          {/* Actions */}
          {content.actions && content.actions.length > 0 && (
            <div className="mt-4 flex gap-2">
              {content.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action.action)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    action.primary
                      ? "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

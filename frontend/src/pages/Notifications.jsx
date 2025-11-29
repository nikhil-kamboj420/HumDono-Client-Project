// pages/Notifications.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HeartIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  SparklesIcon,
  CheckIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import api from "../lib/api";
import Navigation from "../components/Navigation";

export default function Notifications() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get all notifications (no filter)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications({
      type: null,
      limit: 50
    }),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (notificationId) => api.markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: (type) => api.markAllNotificationsRead(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
    },
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (notificationId) => api.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
    },
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <HeartSolid className="w-5 h-5 text-red-500" />;
      case "match":
        return <HeartIcon className="w-5 h-5 text-pink-500" />;
      case "friend_request":
        return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
      case "friend_accepted":
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case "message":
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />;
      case "gift":
        return <GiftIcon className="w-5 h-5 text-purple-500" />;
      case "boost":
        return <SparklesIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <HeartIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // Handle click on profile picture or banner - navigate based on notification type
  const handleProfileClick = (notification) => {
    const { type, sender, data } = notification;
    
    // Mark as read when clicked
    if (!notification.read) {
      markReadMutation.mutate(notification._id);
    }

    switch (type) {
      case "message":
        // Navigate to chat page
        if (data?.matchId) {
          navigate(`/chat/${data.matchId}`, { state: { user: sender } });
        } else if (sender?._id) {
          // Try to find or create a chat
          navigate(`/messages`);
        }
        break;
      case "like":
      case "match":
      case "friend_request":
      case "friend_accepted":
      case "gift":
        // Navigate to user profile
        if (sender?._id) {
          navigate(`/profile/${sender._id}`);
        }
        break;
      default:
        // For other types, navigate to user profile if sender exists
        if (sender?._id) {
          navigate(`/profile/${sender._id}`);
        }
        break;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, data, sender } = notification;
    const userName = sender?.name || "Someone";

    switch (type) {
      case "like":
        return `${userName} liked your profile! 💕`;
      case "match":
        return `You have a new match with ${userName}! 🎉`;
      case "friend_request":
        return `${userName} sent you a friend request`;
      case "friend_accepted":
        return `${userName} accepted your friend request! 🎉`;
      case "message":
        return `${userName} sent you a message`;
      case "gift":
        return `${userName} sent you a ${data?.giftName || "gift"}! 🎁`;
      case "boost":
        return "Your profile was boosted! More people will see you now ⚡";
      default:
        return "You have a new notification";
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sunset-gradient flex items-center justify-center pb-20 lg:pb-0 lg:pr-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4 romantic-pulse"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunset-gradient pb-20 lg:pb-0 lg:pr-64">
      <div className="mx-auto max-w-2xl p-4">
        {/* Floating Mark as Read Button */}
        {notifications?.notifications?.length > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate(null)}
            disabled={markAllReadMutation.isLoading}
            className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed lg:right-[calc(16rem+1rem)]"
          >
            {markAllReadMutation.isLoading ? "..." : "✓ Mark Read"}
          </button>
        )}

        {/* Header - Simple without tabs */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications?.notifications?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600">
                When someone likes your profile or sends you a message, you'll see it here.
              </p>
            </div>
          ) : (
            notifications?.notifications?.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-pink-500 bg-pink-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* User Avatar - Clickable */}
                  <div
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleProfileClick(notification)}
                  >
                    {notification.sender?.photos?.[0]?.url ? (
                      <img
                        src={notification.sender.photos[0].url}
                        alt={notification.sender.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {notification.sender?.name?.[0] || "?"}
                        </span>
                      </div>
                    )}
                    
                    {/* Notification Type Icon */}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content - Also clickable */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleProfileClick(notification)}
                  >
                    <p className="text-gray-900 font-medium text-sm">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Delete Action Only */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(notification._id);
                    }}
                    disabled={deleteMutation.isLoading}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Delete notification"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {notifications?.hasMore && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}

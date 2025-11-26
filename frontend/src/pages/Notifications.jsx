// pages/Notifications.jsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  HeartIcon, 
  UserPlusIcon, 
  ChatBubbleLeftRightIcon,
  GiftIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import api from "../lib/api";
import Navigation from "../components/Navigation";

export default function Notifications() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, likes, matches, friends, messages

  // Get notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => api.getNotifications({ 
      type: filter === "all" ? null : filter,
      limit: 50 
    }),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Get notification counts
  const { data: counts } = useQuery({
    queryKey: ["notification-counts"],
    queryFn: () => api.getNotificationCounts(),
    staleTime: 1000 * 30,
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
        return <HeartSolid className="w-6 h-6 text-red-500" />;
      case "match":
        return <HeartIcon className="w-6 h-6 text-pink-500" />;
      case "friend_request":
        return <UserPlusIcon className="w-6 h-6 text-blue-500" />;
      case "friend_accepted":
        return <CheckIcon className="w-6 h-6 text-green-500" />;
      case "message":
        return <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-500" />;
      case "gift":
        return <GiftIcon className="w-6 h-6 text-purple-500" />;
      case "boost":
        return <SparklesIcon className="w-6 h-6 text-yellow-500" />;
      default:
        return <HeartIcon className="w-6 h-6 text-gray-500" />;
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

  const filterTabs = [
    { key: "all", label: "All", count: counts?.total || 0 },
    { key: "like", label: "Likes", count: counts?.likes || 0 },
    { key: "match", label: "Matches", count: counts?.matches || 0 },
    { key: "friend_request", label: "Requests", count: counts?.friendRequests || 0 },
    { key: "friend_accepted", label: "Accepted", count: counts?.friendAccepted || 0 },
    { key: "message", label: "Messages", count: counts?.messages || 0 },
  ];

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
            onClick={() => markAllReadMutation.mutate(filter === "all" ? null : filter)}
            disabled={markAllReadMutation.isLoading}
            className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed lg:right-[calc(16rem+1rem)]"
          >
            {markAllReadMutation.isLoading ? "..." : "✓ Mark Read"}
          </button>
        )}

        {/* Header */}
        <div className="card-romantic mb-6 p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>

          {/* Filter Tabs - Responsive with visible scrollbar */}
          <div>
            <div className="flex overflow-x-auto space-x-1 bg-gray-100 rounded-lg p-1 notification-scroll">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    filter === tab.key
                      ? "bg-white text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                      filter === tab.key 
                        ? "bg-pink-100 text-pink-600" 
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {tab.count > 99 ? "99+" : tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Scroll indicator below tabs */}
            <div className="flex justify-center mt-1">
              <div className="text-gray-400 text-xs">← Swipe to see more →</div>
            </div>
          </div>
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
                {filter === "all" 
                  ? "When someone likes your profile or sends you a message, you'll see it here."
                  : `No ${filter} notifications yet.`
                }
              </p>
            </div>
          ) : (
            notifications?.notifications?.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-pink-500 bg-pink-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="relative">
                    {notification.sender?.photos?.[0]?.url ? (
                      <img
                        src={notification.sender.photos[0].url}
                        alt={notification.sender.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {notification.sender?.name?.[0] || "?"}
                        </span>
                      </div>
                    )}
                    
                    {/* Notification Type Icon */}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markReadMutation.mutate(notification._id)}
                        disabled={markReadMutation.isLoading}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteMutation.mutate(notification._id)}
                      disabled={deleteMutation.isLoading}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
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

// components/Navigation.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserGroupIcon,
  GiftIcon,
  CogIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import api from "../lib/api";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const [userGender, setUserGender] = useState(null);

  useEffect(() => {
    fetchNotificationCount();
    fetchUserGender();
    // Refresh counts every 10 seconds (more frequent)
    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Refresh counts when location changes (user navigates)
  useEffect(() => {
    fetchNotificationCount();
  }, [location.pathname]);

  const fetchUserGender = async () => {
    try {
      const response = await api.getUserProfile();
      setUserGender(response.user?.gender?.toLowerCase());
    } catch (error) {
      console.error("Error fetching user gender:", error);
    }
  };



  const fetchNotificationCount = async () => {
    try {
      const response = await api.getNotificationCounts();
      // API returns totalUnread field
      const count = response.totalUnread || response.unread || response.unreadCount || 0;
      setNotificationCount(count);
    } catch (error) {
      // Silent fail - don't show error to user
      setNotificationCount(0);
    }
  };

  // Main navigation items for both desktop and mobile
  const mainNavItems = [
    { path: "/", icon: HomeIcon, label: "Discover" },
    { path: "/matches", icon: HeartIcon, label: "Matches" },
    { path: "/messages", icon: ChatBubbleLeftRightIcon, label: "Messages" },
  ];

  // Items that show on mobile bottom nav (first 4 + ellipsis)
  const mobileNavItems = mainNavItems.slice(0, 3);

  // Additional items for desktop sidebar and mobile overflow menu
  // Filter wallet, gifts, and boosts for females
  const additionalItems = [
    { path: "/notifications", icon: BellIcon, label: "Notifications", badge: notificationCount },
    ...(userGender !== 'female' ? [
      { path: "/gifts", icon: GiftIcon, label: "Gifts" },
      { path: "/boosts", icon: SparklesIcon, label: "Boosts" },
      { path: "/wallet", icon: WalletIcon, label: "Wallet" }
    ] : []),
    { path: "/profile", icon: UserIcon, label: "My Profile" },
    { path: "/settings", icon: CogIcon, label: "Settings" },
  ];

  // All items for desktop sidebar
  const allNavItems = [...mainNavItems, ...additionalItems];

  // Overflow items for mobile (items not shown in bottom nav)
  const overflowItems = [
    ...additionalItems,
    { path: "/liked", label: "People I Liked" },
    { path: "/disliked", label: "People I Disliked" },
    { path: "/referrals", label: "Invite Friends" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Right Sidebar Navigation (Romantic Style) */}
      <div className="desktop-sidebar fixed right-0 top-0 h-full w-64 bg-heart-gradient border-l border-pink-200 z-50 overflow-y-auto nav-transition shadow-2xl">
        <div className="p-4">
          {/* Logo/Brand */}
          <div className="flex md:flex-col items-center space-x-3  pb-4 border-b">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-40 w-40 object-contain"
            />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                    isActive(item.path)
                      ? "bg-white/20 text-passion border-r-4 border-red-600 shadow-lg"
                      : "text-red-800/80 hover:bg-white/10 hover:text-red-800"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>

                  {/* Notification badges */}
                  {item.badge && item.badge > 0 && (
                    <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center notification-badge">
                      {item.badge > 9 ? "9+" : item.badge}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Additional Menu Items */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => navigate("/liked")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive("/liked")
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <HeartIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">People I Liked</span>
              </button>

              <button
                onClick={() => navigate("/disliked")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive("/disliked")
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <XMarkIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">People I Disliked</span>
              </button>

              <button
                onClick={() => navigate("/referrals")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive("/referrals")
                    ? "bg-pink-50 text-pink-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <UserIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Invite Friends</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
              >
                <XMarkIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-heart-gradient border-t border-pink-300 z-50">
        <div className="flex items-center">
          {/* Main navigation items (first 3) */}
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center py-2 px-1 relative transition-colors ${
                  isActive(item.path) ? "text-red-700" : "text-red-800/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs mt-1 truncate">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </div>
                )}
              </button>
            );
          })}

          {/* Ellipsis Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex-1 flex flex-col items-center py-2 px-1 text-red-800/70 relative transition-colors"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Overflow Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto nav-transition"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">More Options</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              {overflowItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center p-4 rounded-lg border relative ${
                      isActive(item.path)
                        ? "bg-pink-50 text-pink-600 border-pink-200"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5 mb-2" />}
                    <span className="text-sm font-medium text-center">
                      {item.label}
                    </span>

                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="flex flex-col items-center p-4 rounded-lg border bg-red-50 text-red-600 border-red-200 hover:bg-red-100 col-span-2"
              >
                <XMarkIcon className="w-5 h-5 mb-2" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;

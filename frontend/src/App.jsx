// frontend/src/App.jsx
import { useEffect, useState, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyRegistration from "./pages/VerifyRegistration";
import ProfileCreate from "./pages/ProfileCreate";
import HomeFeed from "./pages/HomeFeed";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";

import Liked from "./pages/Liked";
import Disliked from "./pages/Disliked";
import Boosts from "./pages/Boosts";
import Referrals from "./pages/Referrals";
import Gifts from "./pages/Gifts";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";

import api from "./lib/api";
import Wallet from "./pages/Wallet";
import Subscription from "./pages/Subscription";
import LifetimeSubscription from "./pages/LifetimeSubscription";
import Notifications from "./pages/Notifications";
import NotificationPopup from "./components/NotificationPopup";
import OfflineIndicator from "./components/OfflineIndicator";
import { playSound } from "./utils/simpleSound";

function App() {
  const nav = useNavigate();
  const location = useLocation();
  const [currentNotification, setCurrentNotification] = useState(null);
  const lastNotificationId = useRef(null);

  // Handle notification actions
  const handleNotificationAction = (action, notification) => {
    switch (action) {
      case 'view_chat':
      case 'reply_message':
        // Navigate to messages or specific chat
        if (notification.sender?._id) {
          // Find match with this user and navigate to chat
          nav('/messages');
        } else {
          nav('/messages');
        }
        break;
      
      case 'view_profile':
        if (notification.sender?._id) {
          nav(`/profile/${notification.sender._id}`);
        }
        break;
      
      default:
        break;
    }
  };

  // Check if user is on authenticated page
  const isAuthPage = !['/login', '/register', '/verify-registration'].includes(location.pathname);

  // Global notification polling (only on authenticated pages)
  const { data: notificationData } = useQuery({
    queryKey: ["global-notifications"],
    queryFn: () => api.getNotifications({ limit: 1, unreadOnly: true }),
    refetchInterval: 5000, // Check every 5 seconds
    staleTime: 0,
    enabled: isAuthPage && !!localStorage.getItem("token"), // Only poll when logged in
  });

  // Show notification popup when new notification arrives
  useEffect(() => {
    if (notificationData?.notifications?.length > 0) {
      const latestNotification = notificationData.notifications[0];
      
      // Only show if it's a new notification
      if (latestNotification._id !== lastNotificationId.current) {
        lastNotificationId.current = latestNotification._id;
        setCurrentNotification(latestNotification);
        
        // Play sound based on notification type
        const soundType = latestNotification.type === 'message' ? 'message' : 
                         latestNotification.type === 'match' ? 'match' :
                         latestNotification.type === 'like' ? 'notification' :
                         'notification';
        playSound(soundType);
      }
    }
  }, [notificationData]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      
      // Don't redirect if user is already on a page (not on root)
      if (location.pathname !== '/') {
        // Just ensure token is set in axios
        if (token) api.setAuthToken(token);
        return;
      }
      
      if (token) {
        api.setAuthToken(token);
        try {
          // Validate token and check profile completion
          const response = await api.get('/auth/me');
          const isProfileComplete = response.isProfileComplete;
          
          if (isProfileComplete) {
            nav("/", { replace: true }); // Go to HomeFeed
          } else {
            nav("/profile/create", { replace: true }); // Complete profile first
          }
        } catch (error) {
          // Token invalid, BUT DO NOT LOGOUT per user request
          console.warn('Token validation failed, but keeping session active:', error);
          // We keep the token and let the user stay on the page
          // They will see errors if they try to fetch data, but won't be kicked out
        }
      } else {
        nav("/login", { replace: true });
      }
    };
    
    initAuth();
  }, [nav, location.pathname]);

  return (
    <div className="min-h-screen min-w-screen">
      {/* Offline/Online Indicator */}
      <OfflineIndicator />
      
      {/* Global Notification Popup - Shows on all pages */}
      {currentNotification && (
        <NotificationPopup
          notification={currentNotification}
          onClose={() => setCurrentNotification(null)}
          onAction={handleNotificationAction}
        />
      )}

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-registration" element={<VerifyRegistration />} />
        <Route path="/profile/create" element={<ProfileCreate />} />
        <Route path="/" element={<HomeFeed />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:matchId" element={<Chat />} />

        <Route path="/liked" element={<Liked />} />
        <Route path="/disliked" element={<Disliked />} />
        <Route path="/boosts" element={<Boosts />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/subscription" element={<LifetimeSubscription />} />
        <Route path="/subscription/plans" element={<Subscription />} />
        <Route
          path="/buy"
          element={<div className="p-6">Buy coins page (placeholder)</div>}
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

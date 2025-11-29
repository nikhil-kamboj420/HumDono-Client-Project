// frontend/src/App.jsx
import { useEffect, useState, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyRegistration from "./pages/VerifyRegistration";
import ProfileCreate from "./pages/ProfileCreate";
import HomeFeed from "./pages/HomeFeed";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";

import Likes from "./pages/Likes";
import Dislikes from "./pages/Dislikes";
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
import ScanToPayPage from "./pages/ScanToPayPage";
import ManualPaymentFormPage from "./pages/ManualPaymentFormPage";
import GenericScanToPayPage from "./pages/GenericScanToPayPage";
import GenericSubmitTransactionPage from "./pages/GenericSubmitTransactionPage";
import RequireAuth from "./components/RequireAuth";
import Notifications from "./pages/Notifications";
import NotificationPopup from "./components/NotificationPopup";
import OfflineIndicator from "./components/OfflineIndicator";
import { playSound } from "./utils/simpleSound";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";

function App() {
  const nav = useNavigate();
  const location = useLocation();
  const [currentNotification, setCurrentNotification] = useState(null);
  const lastNotificationId = useRef(null);
  const queryClient = useQueryClient();

  // Handle notification actions
  const handleNotificationAction = (action, notification) => {
    switch (action) {
      case "view_chat":
      case "reply_message":
        // Navigate to messages or specific chat
        if (notification.sender?._id) {
          // Find match with this user and navigate to chat
          nav("/messages");
        } else {
          nav("/messages");
        }
        break;

      case "view_profile":
        if (notification.sender?._id) {
          nav(`/profile/${notification.sender._id}`);
        }
        break;

      default:
        break;
    }
  };

  // Socket.io: listen for real-time notifications (no polling)
  useEffect(() => {
    const isAuthPage = ![
      "/login",
      "/register",
      "/verify-registration",
    ].includes(location.pathname);
    if (!isAuthPage) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { withCredentials: true });

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && user._id) {
        socket.emit("user:join", user._id);
      }
    } catch (err) {
      void err;
    }

    socket.on("notification:new", (latestNotification) => {
      if (!latestNotification) return;
      if (latestNotification._id !== lastNotificationId.current) {
        lastNotificationId.current = latestNotification._id;
        setCurrentNotification(latestNotification);

        const type = latestNotification.type;
        const soundType =
          type === "message"
            ? "message"
            : type === "match"
              ? "match"
              : type === "like"
                ? "notification"
                : "notification";
        playSound(soundType);

        // Refresh notification counts on event
        queryClient.invalidateQueries({ queryKey: ["notification-counts"] });
        // Notify other components to refresh
        window.dispatchEvent(new CustomEvent("humdono:notification"));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [location.pathname, queryClient]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      // Don't redirect if user is already on a page (not on root)
      if (location.pathname !== "/") {
        // Just ensure token is set in axios
        if (token) api.setAuthToken(token);
        return;
      }

      if (token) {
        api.setAuthToken(token);
        try {
          // Validate token and check profile completion
          const response = await api.get("/auth/me");
          const isProfileComplete = response.isProfileComplete;

          if (isProfileComplete) {
            nav("/", { replace: true }); // Go to HomeFeed
          } else {
            nav("/profile/create", { replace: true }); // Complete profile first
          }
        } catch (error) {
          // Token invalid, BUT DO NOT LOGOUT per user request
          console.warn(
            "Token validation failed, but keeping session active:",
            error
          );
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

        {/* Public Pages for KYC Verification */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />

        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:matchId" element={<Chat />} />

          <Route path="/likes" element={<Likes />} />
          <Route path="/dislikes" element={<Dislikes />} />
          <Route path="/boosts" element={<Boosts />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/wallet" element={<Wallet />} />

          {/* Manual Payment Routes for Wallet (Coins) */}
          <Route path="/wallet/scan-to-pay" element={<GenericScanToPayPage />} />
          <Route path="/wallet/submit-transaction" element={<GenericSubmitTransactionPage />} />

          {/* Manual Payment Routes for Boosts */}
          <Route path="/boosts/scan-to-pay" element={<GenericScanToPayPage />} />
          <Route path="/boosts/submit-transaction" element={<GenericSubmitTransactionPage />} />

          {/* Lifetime Subscription Routes */}
          <Route path="/lifetime-access" element={<LifetimeSubscription />} />
          <Route path="/lifetime-access/scan-to-pay" element={<ScanToPayPage />} />
          <Route path="/lifetime-access/submit-transaction" element={<ManualPaymentFormPage />} />

          {/* Subscription Routes */}
          <Route path="/subscription" element={<LifetimeSubscription />} />
          <Route path="/subscription/plans" element={<Subscription />} />
          <Route path="/subscription/scan-to-pay" element={<GenericScanToPayPage />} />
          <Route path="/subscription/submit-transaction" element={<GenericSubmitTransactionPage />} />

          <Route path="/buy" element={<div className="p-6">Buy coins page (placeholder)</div>} />
        </Route>

        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

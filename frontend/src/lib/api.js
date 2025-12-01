// frontend/src/lib/api.js
import { axiosInstance, setAxiosAuthToken } from "./axios";

/**
 * -------------------------------
 * AUTH APIs
 * -------------------------------
 */

/** Send OTP */
export const sendOtp = async (phone) => {
  const res = await axiosInstance.post("/auth/send-otp", { phone });
  return res.data; // { ok, demoOtp? }
};

/** Verify OTP → returns { token, user, isProfileComplete } */
export const verifyOtp = async ({ phone, otp }) => {
  const res = await axiosInstance.post("/auth/verify-otp", { phone, otp });

  if (res.data?.token) {
    setAxiosAuthToken(res.data.token); // Access Token
  }

  return res.data;
};

/** Get current user (access token required) */
export const getAuthUser = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data; // { ok, user, isProfileComplete }
};

/** Refresh access token using refreshToken cookie */
export const refreshAccessToken = async () => {
  const res = await axiosInstance.post("/auth/refresh");

  if (res.data?.token) {
    setAxiosAuthToken(res.data.token); // update access token
  }

  return res.data; // { ok, token, user, isProfileComplete }
};

/** Logout user → clears refresh cookie (server) */
export const logoutUser = async () => {
  const res = await axiosInstance.post("/auth/logout");
  setAxiosAuthToken(null);
  return res.data;
};

/**
 * -------------------------------
 * USER APIs
 * -------------------------------
 */

/** Update/Create Profile */
export const updateProfile = async (data) => {
  const res = await axiosInstance.post("/users", data);
  return res.data; // { ok, user, isProfileComplete }
};

/** Upload Photo (buffer/multipart) */
export const uploadPhoto = async (formData, save = false) => {
  const res = await axiosInstance.post(
    `/users/upload-photo?save=${save}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data; // { ok, url, public_id, user? }
};

/** Get /users/me (authenticated user from users route) */
export const getUserProfile = async () => {
  try {
    const res = await axiosInstance.get("/users/me");
    return res.data;
  } catch (err) {
    console.warn("getUserProfile failed:", err?.response?.data || err);
    return { ok: false, user: null };
  }
};

/** Set profile photo by public_id */
export const setProfilePhoto = async (public_id) => {
  const res = await axiosInstance.put("/users/set-profile-photo", {
    public_id,
  });
  return res.data;
};

/** Delete photo */
export const deletePhoto = async (public_id) => {
  const encodedPublicId = encodeURIComponent(public_id);
  const res = await axiosInstance.delete(`/users/photo/${encodedPublicId}`);
  return res.data;
};

/**
 * -------------------------------
 * FEED & INTERACTIONS
 * -------------------------------
 */

/** Get feed */
export const getFeed = async ({
  limit = 10,
  skip = 0,
  minAge,
  maxAge,
  city,
  relationshipStatus,
  gender,
  verifiedOnly,
  hasPhotos,
} = {}) => {
  const params = { limit, skip };
  if (minAge) params.minAge = minAge;
  if (maxAge) params.maxAge = maxAge;
  if (city) params.city = city;
  if (relationshipStatus) params.relationshipStatus = relationshipStatus;
  if (gender) params.gender = gender;
  if (verifiedOnly) params.verifiedOnly = verifiedOnly;
  if (hasPhotos) params.hasPhotos = hasPhotos;
  try {
    const res = await axiosInstance.get("/feed", { params });
    return res.data; // { ok, results: [...] }
  } catch (err) {
    console.error("Feed fetch failed:", err?.response?.data || err);
    return { ok: false, results: [] };
  }
};

/** Post interaction (like/dislike/superlike) */
export const postInteraction = async ({ to, action }) => {
  const res = await axiosInstance.post("/interactions", { to, action });
  return res.data; // { ok, match: boolean, matchId?, user? }
};

/** Open chat for a match (charge coins or use subscription) */
export const openMatchChat = async (matchId) => {
  const res = await axiosInstance.post(`/matches/${matchId}/open-chat`);
  return res.data; // { ok, chatOpen, from, cost?, balance? } or throws 402
};

/** Request phone access (not reveal) */
export const requestPhoneAccess = async (to) => {
  // If you haven't implemented server endpoint, this will call a placeholder route
  // Server should store a request and notify the other user
  const res = await axiosInstance.post("/requests/phone-access", { to });
  return res.data;
};

/** Get liked users */
export const getLikedUsers = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const res = await axiosInstance.get("/interactions/liked", {
      params: { page, limit },
    });
    return res.data; // { ok, likedUsers }
  } catch (err) {
    console.error("getLikedUsers failed:", err?.response?.data || err);
    return { ok: false, likedUsers: [] };
  }
};

/** Get disliked users */
export const getDislikedUsers = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const res = await axiosInstance.get("/interactions/disliked", {
      params: { page, limit },
    });
    return res.data; // { ok, dislikedUsers }
  } catch (err) {
    console.error("getDislikedUsers failed:", err?.response?.data || err);
    return { ok: false, dislikedUsers: [] };
  }
};

/** Remove an interaction (undo) */
export const removeInteraction = async (userId) => {
  try {
    const res = await axiosInstance.delete(`/interactions/${userId}`);
    return res.data; // { ok }
  } catch (err) {
    console.error("removeInteraction failed:", err?.response?.data || err);
    return { ok: false };
  }
};

/**
 * -------------------------------
 * FRIENDS APIs
 * -------------------------------
 */

/** Send friend request */
export const sendFriendRequest = async (recipientId) => {
  try {
    const res = await axiosInstance.post("/friends/request", { recipientId });
    return res.data; // { ok, request }
  } catch (err) {
    console.error("sendFriendRequest failed:", err?.response?.data || err);
    throw err;
  }
};

/** Get sent friend requests */
export const getSentFriendRequests = async () => {
  try {
    const res = await axiosInstance.get("/friends/sent");
    return res.data; // { ok, sentRequests }
  } catch (err) {
    console.error("getSentFriendRequests failed:", err?.response?.data || err);
    return { ok: false, sentRequests: [] };
  }
};

/** Get received friend requests */
export const getReceivedFriendRequests = async () => {
  try {
    const res = await axiosInstance.get("/friends/received");
    return res.data; // { ok, receivedRequests }
  } catch (err) {
    console.error("getReceivedFriendRequests failed:", err?.response?.data || err);
    return { ok: false, receivedRequests: [] };
  }
};

/** Respond to friend request (accept/reject) */
export const respondToFriendRequest = async (requestId, action) => {
  try {
    const res = await axiosInstance.post(`/friends/request/${requestId}/${action}`);
    return res.data; // { ok }
  } catch (err) {
    console.error("respondToFriendRequest failed:", err?.response?.data || err);
    throw err;
  }
};

/** Get friends list */
export const getFriends = async () => {
  try {
    const res = await axiosInstance.get("/friends");
    return res.data; // { ok, friends }
  } catch (err) {
    console.error("getFriends failed:", err?.response?.data || err);
    return { ok: false, friends: [] };
  }
};


/**
 * -------------------------------
 * NOTIFICATIONS APIs
 * -------------------------------
 */

/** Get notifications */
export const getNotifications = async ({
  page = 1,
  limit = 20,
  type,
  unreadOnly = false,
} = {}) => {
  const params = { page, limit };
  if (type) params.type = type;
  if (unreadOnly) params.unreadOnly = "true";

  const res = await axiosInstance.get("/notifications", { params });
  return res.data;
};

/** Get notification counts */
export const getNotificationCounts = async () => {
  const res = await axiosInstance.get("/notifications/count");
  return res.data;
};

/** Mark notification as read */
export const markNotificationRead = async (notificationId) => {
  const res = await axiosInstance.put(`/notifications/${notificationId}/read`);
  return res.data;
};

/** Mark all notifications as read */
export const markAllNotificationsRead = async (type = null) => {
  const res = await axiosInstance.put("/notifications/mark-all-read", { type });
  return res.data;
};

/** Delete notification */
export const deleteNotification = async (notificationId) => {
  const res = await axiosInstance.delete(`/notifications/${notificationId}`);
  return res.data;
};

/**
 * -------------------------------
 * MESSAGES APIs
 * -------------------------------
 */

/** Get conversations */
export const getConversations = async () => {
  const res = await axiosInstance.get("/messages");
  return res.data;
};

/** Get messages for a match */
export const getMessages = async (matchId, page = 1, limit = 50) => {
  const res = await axiosInstance.get(`/messages/${matchId}`, {
    params: { page, limit },
  });
  return res.data;
};

/** Send message */
export const sendMessage = async (
  matchId,
  content,
  messageType = "text",
  gift = null
) => {
  const res = await axiosInstance.post(`/messages/${matchId}`, {
    content,
    messageType,
    gift,
  });
  return res.data;
};

/** Send direct message to any user (females only - auto-creates match) */
export const sendDirectMessage = async (
  receiverId,
  content,
  messageType = "text"
) => {
  const res = await axiosInstance.post(`/messages/direct/${receiverId}`, {
    content,
    messageType,
  });
  return res.data;
};

/**
 * -------------------------------
 * GENERIC HTTP METHODS
 * -------------------------------
 */

/** Generic GET method */
export const get = async (url, config = {}) => {
  const res = await axiosInstance.get(url, config);
  return res.data;
};

/** Generic POST method */
export const post = async (url, data = {}, config = {}) => {
  const res = await axiosInstance.post(url, data, config);
  return res.data;
};

/** Generic PUT method */
export const put = async (url, data = {}, config = {}) => {
  const res = await axiosInstance.put(url, data, config);
  return res.data;
};

/** Generic DELETE method */
export const deleteRequest = async (url, config = {}) => {
  const res = await axiosInstance.delete(url, config);
  return res.data;
};

/**
 * Default export for convenience
 */
const api = {
  setAuthToken: setAxiosAuthToken,
  sendOtp,
  verifyOtp,
  refreshAccessToken,
  getAuthUser,
  logoutUser,
  updateProfile,
  uploadPhoto,
  getUserProfile,
  setProfilePhoto,
  deletePhoto,

  // feed & interactions
  getFeed,
  postInteraction,
  openMatchChat,
  getLikedUsers,
  getDislikedUsers,
  removeInteraction,

  requestPhoneAccess,

  // friends
  sendFriendRequest,
  getSentFriendRequests,
  getReceivedFriendRequests,
  respondToFriendRequest,
  getFriends,

  // notifications
  getNotifications,
  getNotificationCounts,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,

  // messages
  getConversations,
  getMessages,
  sendMessage,
  sendDirectMessage,

  // boosts
  activateBoost: async (type) => {
    const res = await axiosInstance.post('/boosts/activate', { type });
    return res.data;
  },

  // Generic HTTP methods
  get,
  post,
  put,
  delete: deleteRequest,

  axios: axiosInstance,
};

export default api;

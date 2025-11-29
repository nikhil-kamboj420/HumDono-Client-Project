// frontend/src/lib/axios.js
import axios from "axios";

/**
 * Base URL
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Primary axios instance (used by the app)
 * withCredentials: true → allows sending cookies (refresh token cookie)
 */
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Lightweight client WITHOUT interceptors for refresh calls.
 * Important: it must not trigger the same 401 interceptor, so we use a fresh instance.
 */
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Set / Remove Authorization header helper
 */
export const setAxiosAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("token", token);
    } catch (err) {
      console.warn("Failed to save token:", err);
    }
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("token");
    } catch (err) {
      // ignore
    }
  }
};

/**
 * Load token from localStorage on page refresh (restore Authorization header)
 */
const storedToken = (() => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
})();

if (storedToken) {
  setAxiosAuthToken(storedToken);
}

/**
 * Refresh handling:
 * - single refresh in-flight (isRefreshing)
 * - queue requests while refresh is in progress (failedQueue)
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Push a promise resolver/rejector into the queue
 */
const enqueueFailedRequest = (cb) =>
  new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject, cb });
  });

/**
 * When refresh finishes, resolve or reject queued requests
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor:
 * - On 401: attempt /auth/refresh using refreshClient
 * - If refresh succeeds: set new Authorization header and retry original request
 * - If refresh fails: clear auth and reject (caller should redirect to login)
 */
axiosInstance.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;

    // If no response or not 401, forward the error
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const hasAuthHeader = Boolean(
      (originalRequest && originalRequest.headers && originalRequest.headers["Authorization"]) ||
      axiosInstance.defaults.headers.common["Authorization"]
    );
    if (!hasAuthHeader) {
      return Promise.reject(error);
    }

    // Prevent infinite loops
    if (originalRequest._retry) {
      // already retried once -> fail
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        // If a refresh is already happening, wait for it
        const token = await enqueueFailedRequest();
        // attach new token and retry original request
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      }

      isRefreshing = true;

      // Call refresh endpoint using refreshClient (separate instance)
      const refreshRes = await refreshClient.post("/auth/refresh");

      const newToken = refreshRes?.data?.token;
      if (!newToken) {
        // refresh didn't return token -> force logout
        processQueue(new Error("No token returned from refresh"), null);
        // setAxiosAuthToken(null); // Don't clear token immediately, let user stay "logged in" visually
        isRefreshing = false;
        return Promise.reject(error);
      }

      // persist new token & update main axios header
      setAxiosAuthToken(newToken);

      // resolve queued requests with new token
      processQueue(null, newToken);

      // retry original request with new token
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      isRefreshing = false;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Check if error is due to network issue (offline)
      const isNetworkError = !refreshError.response || 
                            refreshError.code === 'ERR_NETWORK' ||
                            refreshError.message === 'Network Error';
      
      if (isNetworkError) {
        // Don't logout on network errors - user might be offline
        console.warn('Network error during refresh - user might be offline');
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
      
      // On actual auth failure (refresh token invalid/expired)
      // We DO NOT auto-logout the user here anymore as per request.
      // We just reject the request. The user will see an error but stay on the page.
      // They will only be logged out if they manually click logout.
      
      console.warn('Refresh failed, but keeping user session active locally per user request.');
      processQueue(refreshError, null);
      isRefreshing = false;
      
      // We do NOT clear localStorage or redirect to login
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;

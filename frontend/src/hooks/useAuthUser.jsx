// frontend/src/hooks/useAuthUser.jsx
import { useQuery } from "@tanstack/react-query";
import { getAuthUser, refreshAccessToken } from "../lib/api";
import { setAxiosAuthToken } from "../lib/axios";

/**
 * useAuthUser()
 *
 * - Loads token from localStorage
 * - Restores axios Authorization header
 * - Calls /auth/me
 * - If /auth/me fails with 401 → tries silent refresh (/auth/refresh)
 * - If refresh succeeds → sets new token & retries
 * - Returns { authUser, isLoading }
 */

export default function useAuthUser() {
  const token = (() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  })();

  if (token) {
    setAxiosAuthToken(token);
  }

  const query = useQuery({
    queryKey: ["authUser"],
    enabled: Boolean(token), // only run if token exists
    retry: false,

    queryFn: async () => {
      try {
        // 1️⃣ Try normal access token
        const res = await getAuthUser(); // GET /auth/me
        return res.user;
      } catch (err) {
        const status = err?.response?.status;

        // 2️⃣ If unauthorized → attempt refresh token
        if (status === 401) {
          try {
            const refreshed = await refreshAccessToken(); // POST /auth/refresh

            if (refreshed?.token) {
              setAxiosAuthToken(refreshed.token);
              localStorage.setItem("token", refreshed.token);
            }

            return refreshed?.user ?? null;
          } catch (e) {
            // refresh failed → but keep user logged in locally per user request
            console.warn('Refresh failed in useAuthUser, but keeping session active');
            // DO NOT clear localStorage or token
            // User will see errors but won't be auto-logged out
            return null;
          }
        }

        // any other error
        return null;
      }
    },
  });

  return {
    isLoading: query.isLoading,
    authUser: query.data ?? null,
  };
}

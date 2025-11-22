// frontend/src/hooks/useVerifyOtp.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyOtp } from "../lib/api";
import { setAxiosAuthToken } from "../lib/axios";

/**
 * useVerifyOtp
 * - Calls verifyOtp({ phone, otp })
 * - On success: sets axios auth header, stores token/user in localStorage,
 *   and invalidates 'authUser' query so other parts of app refresh.
 *
 * Accepts an `options` object to pass custom onSuccess/onError/etc.
 */
export default function useVerifyOtp(options = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, otp }) => verifyOtp({ phone, otp }),
    onSuccess: (data, vars, context) => {
      // expected data: { ok: true, token, user, isProfileComplete? }
      const token = data?.token;
      const user = data?.user;

      if (token) {
        try {
          setAxiosAuthToken(token);
          localStorage.setItem("token", token);
        } catch (e) {
          console.warn("Failed to persist token:", e);
        }
      }

      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.warn("Failed to persist user:", e);
        }
      }

      // make sure other queries depending on auth refresh
      try {
        qc.invalidateQueries(["authUser"]);
        qc.invalidateQueries(["userProfile"]);
      } catch (e) {
        // ignore
      }

      // call user-provided onSuccess if present
      if (typeof options.onSuccess === "function") {
        options.onSuccess(data, vars, context);
      }
    },
    onError: (err, vars, context) => {
      if (typeof options.onError === "function") {
        options.onError(err, vars, context);
      }
    },
    ...options,
  });
}

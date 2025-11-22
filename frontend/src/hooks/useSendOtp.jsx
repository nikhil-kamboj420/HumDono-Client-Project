// frontend/src/hooks/useSendOtp.jsx
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "../lib/api";

/**
 * useSendOtp Mutation
 *
 * - Calls /auth/send-otp
 * - Accepts phone (string)
 * - Returns { ok, demoOtp? } from backend
 * - Passes through onSuccess / onError handlers from options
 */
export default function useSendOtp(options = {}) {
  return useMutation({
    mutationFn: (phone) => sendOtp(phone),
    ...options,
  });
}

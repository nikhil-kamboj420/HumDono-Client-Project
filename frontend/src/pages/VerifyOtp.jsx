// frontend/src/pages/VerifyOtp.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useVerifyOtp from "../hooks/useVerifyOtp"; // TanStack mutation hook
import { setAxiosAuthToken } from "../lib/axios";
import api from "../lib/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // normalize phone to digits and optional leading plus
  const normalizePhone = (raw) => {
    if (!raw) return "";
    const keepPlus = String(raw).trim().startsWith("+") ? "+" : "";
    const digits = String(raw).replace(/[^\d]/g, "");
    return keepPlus + digits;
  };

  // load saved phone from sessionStorage (set by LoginPhone)
  useEffect(() => {
    const p = sessionStorage.getItem("otpPhone");
    if (p) setPhone(p);
    const demo = sessionStorage.getItem("demoOtp");
    if (demo) setInfo(`(Enter OTP: ${demo})`);
  }, []);

  // mutation hook — useVerifyOtp already persists token/user and invalidates queries.
  const mutation = useVerifyOtp({
    onSuccess: (data) => {
      // data: { ok: true, token, user, isProfileComplete? }
      const token = data?.token;
      const user = data?.user;

      // set axios header & localStorage just to be extra-safe (hook already does this)
      if (token) {
        try {
          setAxiosAuthToken(token);
          localStorage.setItem("token", token);
        } catch (e) {
          console.warn("Failed to save token:", e);
        }
      }
      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
          console.warn("Failed to save user:", e);
        }
      }

      // cleanup sessionStorage demo otp & otpPhone
      try {
        sessionStorage.removeItem("demoOtp");
        sessionStorage.removeItem("otpPhone");
      } catch (e) {}

      // redirect depending on profile completeness (prefer explicit flag)
      const isProfileComplete = data?.isProfileComplete ?? Boolean(user?.name);
      const dest = isProfileComplete ? "/" : "/profile/create";
      
      navigate(dest, { replace: true });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to verify OTP. Try again.";
      setErr(message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    const ph = normalizePhone(phone);
    if (!ph || !otp) return setErr("Phone and OTP are required");
    mutation.mutate({ phone: ph, otp: String(otp).trim() });
  };

  const handleResend = async () => {
    setErr("");
    const ph = normalizePhone(phone);
    if (!ph) return setErr("No phone number available to resend OTP.");
    try {
      setInfo("Resending OTP…");
      await api.sendOtp(ph); // sendOtp expects a phone string
      setInfo("OTP resent — check your phone.");
    } catch (e) {
      console.error("Resend failed:", e);
      setErr(e?.response?.data?.error || "Failed to resend OTP");
      setInfo("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971]">
      <div className="w-full max-w-md bg-[#ffebf1] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#ff4c91]/20">
        <div className="flex flex-col items-center mb-4">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60  sm:h-30 sm:w-60 lg:h-40 lg:w-80 object-contain"
          />
          <h2 className="mt-3 text-xl font-bold text-[#cc0033]">Verify OTP</h2>
          <p className="text-sm text-[#77001c] mt-1">Enter the 6-digit OTP for  your phone number.</p>
          {info && <p className="text-xs text-[#77001c] mt-1">{info}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-sm"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-sm"
              placeholder="123456"
            />
          </div>

          {err && <div className="text-sm text-red-600 font-medium">{err}</div>}

          <button
            type="submit"
            disabled={mutation.isLoading}
            className="mt-2 w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-[#cc0033] to-[#ff1971]
                       shadow-md hover:opacity-90 active:scale-95 transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isLoading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="mt-3 text-xs text-[#77001c] text-center">
            Didn't receive OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-[#cc0033] underline"
              disabled={mutation.isLoading}
            >
              Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

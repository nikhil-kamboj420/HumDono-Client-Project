// frontend/src/pages/VerifyRegistration.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import { setAxiosAuthToken } from "../lib/axios";

export default function VerifyRegistration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("registerEmail");
    const savedPassword = sessionStorage.getItem("registerPassword");
    const demoOtp = sessionStorage.getItem("demoOtp");

    if (!savedEmail || !savedPassword) {
      navigate("/register");
      return;
    }

    setEmail(savedEmail);
    setPassword(savedPassword);

    setInfo("Check your email for the verification code");
  }, [navigate]);

  const verifyMutation = useMutation({
    mutationFn: (data) => api.post("/auth/verify-registration", data),
    onSuccess: (res) => {
      // Save token and user
      if (res.token) {
        setAxiosAuthToken(res.token);
        localStorage.setItem("token", res.token);
      }
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      // Clear session storage
      sessionStorage.removeItem("registerEmail");
      sessionStorage.removeItem("registerPassword");
      sessionStorage.removeItem("demoOtp");

      // Redirect to profile creation
      navigate("/profile/create", { replace: true });
    },
    onError: (err) => {
      setError(err?.response?.data?.error || "Verification failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      return setError("Please enter the OTP");
    }

    if (otp.length !== 6) {
      return setError("OTP must be 6 digits");
    }

    verifyMutation.mutate({ email, password, otp });
  };

  const handleResend = async () => {
    setError("");
    setInfo("Resending OTP...");

    try {
      await api.post("/auth/register", { email, password });
      setInfo("New OTP sent to your email");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to resend OTP");
      setInfo("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971]">
      <div className="w-full max-w-md bg-[#ffebf1] rounded-2xl shadow-2xl p-6 sm:p-8
                      border border-[#ff4c91]/20">
        {/* Logo */}
        <header className="flex flex-col items-center mb-4">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60 sm:h-30 sm:w-60 lg:h-40 lg:w-80 object-contain"
          />
          <h2 className="mt-3 text-xl font-bold text-[#cc0033]">Verify Your Email</h2>
          <p className="text-sm text-[#77001c] mt-1 text-center">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-medium text-[#cc0033]">{email}</p>
          {info && (
            <p className="text-xs text-[#77001c] mt-2 bg-white px-3 py-1 rounded-lg">
              {info}
            </p>
          )}
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              placeholder="123456"
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-center text-2xl tracking-widest
                         font-bold"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifyMutation.isLoading}
            className="w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-[#cc0033] to-[#ff1971]
                       shadow-md hover:opacity-90 active:scale-95
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifyMutation.isLoading ? "Verifying..." : "Verify & Continue"}
          </button>

          {/* Resend Link */}
          <div className="text-center text-sm text-[#77001c]">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-[#cc0033] font-medium underline"
              disabled={verifyMutation.isLoading}
            >
              Resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

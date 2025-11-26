// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: (data) => api.post("/auth/register", data),
    onSuccess: (res) => {
      // Store email and demo OTP for verification page
      sessionStorage.setItem("registerEmail", email);
      sessionStorage.setItem("registerPassword", password);
      if (res.demoOtp) {
        sessionStorage.setItem("demoOtp", res.demoOtp);
      }
      navigate("/verify-registration");
    },
    onError: (err) => {
      setError(err?.response?.data?.error || "Registration failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password || !confirmPassword) {
      return setError("All fields are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Invalid email format");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    registerMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971]">
      <div className="w-full max-w-md bg-[#ffebf1] rounded-2xl shadow-2xl p-6 sm:p-8
                      border border-[#ff4c91]/20">
        {/* Logo */}
        <header className="flex flex-col items-center mb-5">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60 sm:h-30 sm:w-60 lg:h-40 lg:w-80 object-contain"
          />
          <p className="mt-1 text-sm sm:text-base text-[#77001c] text-center max-w-xs">
            Create your account to find real connections
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-sm sm:text-base"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-sm sm:text-base"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-[#77001c] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                         focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                         outline-none bg-white text-sm sm:text-base"
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
            disabled={registerMutation.isPending}
            className="w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-[#cc0033] to-[#ff1971]
                       shadow-md hover:opacity-90 active:scale-95
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {registerMutation.isPending && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            {registerMutation.isPending ? "Signing up..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-[#77001c]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#cc0033] font-medium underline">
              Login
            </Link>
          </div>

          {/* Terms */}
          <div className="mt-4 text-xs text-[#77001c] text-center">
            By continuing, you agree to our{" "}
            <span className="text-[#cc0033] underline">Terms</span> &{" "}
            <span className="text-[#cc0033] underline">Privacy</span>.
          </div>
        </form>
      </div>
    </div>
  );
}

// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import { setAxiosAuthToken } from "../lib/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (data) => api.post("/auth/login", data),
    onSuccess: (res) => {
      // Save token and user
      if (res.token) {
        setAxiosAuthToken(res.token);
        localStorage.setItem("token", res.token);
      }
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }

      // Redirect based on profile completion
      const dest = res.isProfileComplete ? "/" : "/profile/create";
      navigate(dest, { replace: true });
    },
    onError: (err) => {
      setError(err?.response?.data?.error || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("Email and password are required");
    }

    loginMutation.mutate({ email, password });
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
            Welcome back! Login to continue
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
              placeholder="Enter your password"
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
            disabled={loginMutation.isLoading}
            className="w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-[#cc0033] to-[#ff1971]
                       shadow-md hover:opacity-90 active:scale-95
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginMutation.isLoading ? "Logging in..." : "Login"}
          </button>

          {/* Register Link */}
          <div className="text-center text-sm text-[#77001c]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#cc0033] font-medium underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

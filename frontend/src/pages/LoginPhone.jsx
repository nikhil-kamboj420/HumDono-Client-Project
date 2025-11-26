// frontend/src/pages/LoginPhone.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useSendOtp from "../hooks/useSendOtp";
import api from "../lib/api";
import { setAxiosAuthToken } from "../lib/axios";

export default function LoginPhone() {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(true); // silent auth check on mount
  const navigate = useNavigate();

  // existing sendOtp mutation (unchanged)
  const sendOtpMutation = useSendOtp({
    onSuccess: (res) => {
      sessionStorage.setItem("otpPhone", phone);
      if (res.demoOtp) sessionStorage.setItem("demoOtp", res.demoOtp);
      navigate("/verify");
    },
    onError: (err) => {
      setErr(err?.response?.data?.error || "Failed to send OTP");
    },
  });

  // helper: save user+token locally
  const saveAuth = (user, token) => {
    try {
      if (token) {
        setAxiosAuthToken(token);
        localStorage.setItem("token", token);
      }
      if (user) localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      console.warn("saveAuth failed", e);
    }
  };

  // clear local auth state
  const clearAuth = () => {
    try {
      setAxiosAuthToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      // ignore
    }
  };

  // normalize phone to digits and optional leading plus
  const normalizePhone = (raw) => {
    if (!raw) return "";
    const keepPlus = String(raw).trim().startsWith("+") ? "+" : "";
    const digits = String(raw).replace(/[^\d]/g, "");
    return keepPlus + digits;
  };

  // on mount: try silent login
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (mounted) setChecking(false);
          return;
        }

        // set header and call /auth/me
        setAxiosAuthToken(token);
        try {
          const res = await api.getAuthUser(); // GET /auth/me
          if (!mounted) return;
          if (res?.user) {
            // user found, save and redirect
            saveAuth(res.user, res.token ?? token);
            const dest = res.isProfileComplete ?? Boolean(res.user?.name)
              ? "/"
              : "/profile/create";
            navigate(dest, { replace: true });
            return;
          }
        } catch (meErr) {
          // if 401 -> try refresh; otherwise fallthrough to show OTP UI
          const status = meErr?.response?.status;
          if (status !== 401) {
            // some other error (network), just show OTP UI
            console.warn("/auth/me error:", meErr);
            clearAuth();
            if (mounted) setChecking(false);
            return;
          }

          // 401 -> try refresh token via cookie
          try {
            const refreshRes = await api.refreshAccessToken();
            if (!mounted) return;
            if (refreshRes?.token) {
              // got new access token + user
              const newToken = refreshRes.token;
              const user = refreshRes.user;
              saveAuth(user, newToken);
              const dest = refreshRes.isProfileComplete ?? Boolean(user?.name)
                ? "/"
                : "/profile/create";
              navigate(dest, { replace: true });
              return;
            } else {
              // refresh didn't return token -> show OTP UI
              clearAuth();
              if (mounted) setChecking(false);
              return;
            }
          } catch (refreshErr) {
            console.warn("/auth/refresh failed:", refreshErr?.response?.data || refreshErr);
            clearAuth();
            if (mounted) setChecking(false);
            return;
          }
        }
      } catch (err) {
        console.error("Silent auth check error:", err);
        clearAuth();
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // validate phone number
  const validatePhone = (ph) => {
    if (!ph) return "Enter phone number";
    
    // Remove + if present for validation
    const digits = ph.replace(/^\+/, '');
    
    // Check if only digits
    if (!/^\d+$/.test(digits)) {
      return "Phone number should contain only digits";
    }
    
    // Check length (10-15 digits is standard for international numbers)
    if (digits.length < 10) {
      return "Phone number must be at least 10 digits";
    }
    
    if (digits.length > 15) {
      return "Phone number cannot exceed 15 digits";
    }
    
    return null;
  };

  // handle explicit "Login" button: try silent-login for entered phone
  const handleSilentLogin = async () => {
    setErr("");
    const ph = normalizePhone(phone);
    
    const validationError = validatePhone(ph);
    if (validationError) return setErr(validationError);

    setChecking(true);

    try {
      // 1) Try existing access token first
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setAxiosAuthToken(storedToken);
        try {
          const meRes = await api.getAuthUser();
          if (meRes?.user && meRes.user.phone === ph) {
            saveAuth(meRes.user, meRes.token ?? storedToken);
            const dest = meRes.isProfileComplete ?? Boolean(meRes.user?.name)
              ? "/"
              : "/profile/create";
            navigate(dest, { replace: true });
            return;
          } else {
            // token belongs to a different phone -> security: require OTP
            clearAuth();
            setChecking(false);
            sessionStorage.setItem("otpPhone", ph);
            return setErr("Session belongs to a different number. Please use OTP.");
          }
        } catch (meErr) {
          // fall through to refresh
        }
      }

      // 2) Try refresh (uses httpOnly cookie)
      try {
        const refreshRes = await api.refreshAccessToken();
        if (refreshRes?.token && refreshRes?.user) {
          if (refreshRes.user.phone === ph) {
            saveAuth(refreshRes.user, refreshRes.token);
            const dest = refreshRes.isProfileComplete ?? Boolean(refreshRes.user?.name)
              ? "/"
              : "/profile/create";
            navigate(dest, { replace: true });
            return;
          } else {
            // refresh returned different user -> require OTP
            clearAuth();
            setChecking(false);
            sessionStorage.setItem("otpPhone", ph);
            return setErr("Session belongs to a different account. Please use OTP.");
          }
        } else {
          // refresh didn't give token -> fallback to OTP
          clearAuth();
          setChecking(false);
          sessionStorage.setItem("otpPhone", ph);
          navigate("/verify");
          return;
        }
      } catch (refreshErr) {
        // refresh failed -> fallback to OTP
        clearAuth();
        setChecking(false);
        sessionStorage.setItem("otpPhone", ph);
        navigate("/verify");
        return;
      }
    } catch (err) {
      console.error("Silent login error:", err);
      clearAuth();
      setChecking(false);
      sessionStorage.setItem("otpPhone", ph);
      navigate("/verify");
    }
  };

  const handleSendOtp = () => {
    setErr("");
    const ph = normalizePhone(phone);
    
    const validationError = validatePhone(ph);
    if (validationError) return setErr(validationError);
    
    sendOtpMutation.mutate(ph);
  };

  // Loading / checking token UI
  if (checking || sendOtpMutation.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4
                      bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971]">
        <div className="w-full max-w-md bg-[#ffebf1] rounded-2xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.png"
              alt="HumDono Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold text-[#cc0033]">Signing you in…</h3>
          <p className="mt-2 text-sm text-[#77001c]">Checking your session — please wait.</p>
        </div>
      </div>
    );
  }

  // Default: show phone input / OTP signup flow
  return (
    <div className="min-h-screen flex items-center justify-center p-4
                    bg-gradient-to-br from-[#cc0033] via-[#d2004f] to-[#ff1971]">

      <div className="w-full max-w-md bg-[#ffebf1] rounded-2xl shadow-2xl p-6 sm:p-8
                      border border-[#ff4c91]/20 backdrop-blur-sm">

        {/* LOGO */}
        <header className="flex flex-col items-center mb-5">
          <img
            src="/logo.png"
            alt="HumDono Logo"
            className="h-30 w-60  sm:h-30 sm:w-60 lg:h-40 lg:w-80 object-contain"
          />

          <p className="mt-1 text-sm sm:text-base text-[#77001c] text-center max-w-xs">
            Real connections nearby — quick signup with phone
          </p>
        </header>

        {/* INPUT + BUTTONS */}
        <main>
          <label className="block text-xs font-medium text-[#77001c] mb-2">
            Phone Number
          </label>

          <input
            type="tel"
            inputMode="tel"
            aria-label="phone"
            placeholder="+91"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 rounded-xl text-black border border-[#ff4c91]
                       focus:border-[#d2004f] focus:ring-2 focus:ring-[#ff1971]/30
                       outline-none bg-white text-sm sm:text-base"
          />

          {err && (
            <p className="mt-3 text-sm text-red-600 font-medium" role="alert">
              {err}
            </p>
          )}

          {/* SIGNUP BUTTON */}
          <button
            onClick={handleSendOtp}
            disabled={sendOtpMutation.isLoading}
            className="mt-5 w-full py-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-[#cc0033] to-[#ff1971]
                       shadow-md hover:opacity-90 active:scale-95
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sendOtpMutation.isLoading ? "Sending..." : "Sign up with Phone"}
          </button>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleSilentLogin}
            className="mt-3 w-full py-2 rounded-xl font-medium
                       text-[#cc0033] border border-[#d2004f]
                       bg-white hover:bg-[#ffe8ee] transition"
          >
            Login
          </button>

          {/* FOOTER */}
          <div className="mt-4 text-xs text-[#77001c] text-center">
            By continuing, you agree to our{" "}
            <span className="text-[#cc0033] underline">Terms</span> &{" "}
            <span className="text-[#cc0033] underline">Privacy</span>.
          </div>
        </main>
      </div>
    </div>
  );
}

// middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * Access-token auth middleware
 * Validates Bearer token and sets req.user = { userId, phone }
 * Used for all protected routes (/api/users/*, etc.)
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;

    if (!authHeader) {
      return res.status(401).json({ ok: false, error: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ ok: false, error: "Invalid token format" });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ ok: false, error: "Token missing" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, error: "Invalid or expired token" });
    }

    req.user = payload; // contains { userId, phone }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

// Export as both default and named export for compatibility
export default authMiddleware;
export const protect = authMiddleware;

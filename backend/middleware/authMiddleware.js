// Authentication and authorization middleware.
const jwt       = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Verify the JWT and attach the current user to req.user.
// Must run before any route handler that needs to know who is logged in.
async function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({ message: "Authentication is not configured" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (
            !payload ||
            (typeof payload.userId !== "number" &&
             typeof payload.userId !== "string")
        ) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        const user = await userModel.findUserById(payload.userId);

        if (!user || !user.is_active) {
            return res.status(401).json({ message: "Account is unavailable" });
        }

        // Attach the authenticated user to the request for downstream handlers
        req.user = user;
        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError"  ||
            error.name === "TokenExpiredError"  ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({ message: "Invalid or expired authentication token" });
        }

        console.error("Authentication failed:", error.message);
        return res.status(500).json({ message: "Authentication failed" });
    }
}

// Return a middleware that checks the authenticated user's role.
// Usage: requireRole("ADMIN") or requireRole("ADMIN", "PROJECT_MANAGER")
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication is required" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action" });
        }

        next();
    };
}

module.exports = { authenticateToken, requireRole };
const { rateLimit } = require("express-rate-limit");

// Limit repeated login attempts from the same IP address
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again in 15 minutes."
    }
});

// Limit excessive account registration requests
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many registration attempts. Please try again later."
    }
});

// Limit excessive password reset requests from the same IP address
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many password reset requests. Please try again in 15 minutes."
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    passwordResetLimiter
};

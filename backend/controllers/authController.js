// Handles user registration and login.
const bcrypt    = require("bcrypt");
const jwt       = require("jsonwebtoken");
const crypto    = require("crypto");
const pool      = require("../db");
const userModel = require("../models/userModel");

// POST /api/auth/register — validate input, hash password, create user
async function register(req, res) {
    try {
        const { name, email, password } = req.body ?? {};

        // Validate name
        if (
            typeof name !== "string" ||
            name.trim().length === 0 ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Name must be between 1 and 100 characters",
            });
        }

        // Validate email format
        if (
            typeof email !== "string" ||
            email.trim().length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return res.status(400).json({
                message: "Please provide a valid email address",
            });
        }

        // Validate password length (bcrypt truncates at 72 bytes)
        if (
            typeof password !== "string" ||
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes",
            });
        }

        const normalizedName  = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Reject duplicate emails before doing the expensive bcrypt hash
        const existingUser = await userModel.findUserByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        // Hash password with cost factor 12 (~300 ms, secure for production)
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await userModel.createUser({
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
        });

        return res.status(201).json({ message: "Registration successful", user });
    } catch (error) {
        // PostgreSQL unique constraint violation — handles race conditions
        if (error.code === "23505") {
            return res.status(409).json({ message: "Email is already registered" });
        }

        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Registration failed" });
    }
}

// POST /api/auth/login — verify credentials and return a signed JWT
async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user            = await userModel.findUserByEmail(normalizedEmail);

        // Same error for "not found" and "inactive" — prevents user enumeration
        if (!user || !user.is_active) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            return res.status(500).json({ message: "Authentication is not configured" });
        }

        // Sign a short-lived token with only the user ID in the payload
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id:    user.id,
                name:  user.name,
                email: user.email,
                role:  user.role,
            },
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
}

// GET /api/auth/profile — authenticated user profile
async function getProfile(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        return res.json({ user: req.user });
    } catch (error) {
        console.error("Failed to retrieve profile:", error.message);
        return res.status(500).json({ message: "Failed to retrieve profile" });
    }
}

// PATCH /api/auth/profile — update own name or change password
async function updateProfile(req, res) {
    try {
        const { name, currentPassword, newPassword } = req.body ?? {};

        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
                return res.status(400).json({
                    message: "Name must be between 1 and 100 characters"
                });
            }
            fields.push(`name = $${paramIndex++}`);
            values.push(name.trim());
        }

        if (newPassword !== undefined) {
            if (typeof currentPassword !== "string" || !currentPassword) {
                return res.status(400).json({
                    message: "Current password is required to change password"
                });
            }

            if (
                typeof newPassword !== "string" ||
                newPassword.length < 8 ||
                Buffer.byteLength(newPassword, "utf8") > 72
            ) {
                return res.status(400).json({
                    message: "New password must be at least 8 characters and no more than 72 UTF-8 bytes"
                });
            }

            // Fetch password hash to verify current password
            const fullUser = await pool.query(
                "SELECT password_hash FROM users WHERE id = $1",
                [req.user.id]
            );

            if (!fullUser.rows[0]) {
                return res.status(404).json({ message: "User not found" });
            }

            const currentValid = await bcrypt.compare(
                currentPassword,
                fullUser.rows[0].password_hash
            );

            if (!currentValid) {
                return res.status(400).json({
                    message: "Current password is incorrect"
                });
            }

            const newHash = await bcrypt.hash(newPassword, 12);
            fields.push(`password_hash = $${paramIndex++}`);
            values.push(newHash);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                message: "No profile updates provided"
            });
        }

        fields.push("updated_at = NOW()");
        values.push(req.user.id);

        const updateResult = await pool.query(
            `UPDATE users
             SET ${fields.join(", ")}
             WHERE id = $${paramIndex}
             RETURNING id, name, email, role, is_active, created_at, updated_at`,
            values
        );

        return res.json({
            message: "Profile updated successfully",
            user: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Profile update failed:", error.message);
        return res.status(500).json({ message: "Failed to update profile" });
    }
}

// POST /api/auth/forgot-password — generate secure password reset token
async function forgotPassword(req, res) {
    try {
        const { email } = req.body ?? {};

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await userModel.findUserByEmail(normalizedEmail);

        // Security: always return generic message to prevent email enumeration
        if (!user || !user.is_active) {
            return res.json({
                message: "If an account with that email exists, reset instructions have been generated."
            });
        }

        // Generate 32-byte cryptographic token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash  = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expiresAt  = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await pool.query(
            `INSERT INTO password_resets (user_id, token_hash, expires_at, used)
             VALUES ($1, $2, $3, false)`,
            [user.id, tokenHash, expiresAt]
        );

        return res.json({
            message: "If an account with that email exists, reset instructions have been generated.",
            resetToken // Included for development/demo testing
        });
    } catch (error) {
        console.error("Forgot password request failed:", error.message);
        return res.status(500).json({ message: "Failed to process request" });
    }
}

// POST /api/auth/reset-password — verify token and apply new password
async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body ?? {};

        if (typeof token !== "string" || !token.trim()) {
            return res.status(400).json({ message: "Reset token is required" });
        }

        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and no more than 72 UTF-8 bytes"
            });
        }

        const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

        const resetQuery = await pool.query(
            `SELECT id, user_id, expires_at, used
             FROM password_resets
             WHERE token_hash = $1
               AND used = false
               AND expires_at > NOW()
             ORDER BY id DESC
             LIMIT 1`,
            [tokenHash]
        );

        const resetRecord = resetQuery.rows[0];
        if (!resetRecord) {
            return res.status(400).json({
                message: "Password reset link is invalid or has expired."
            });
        }

        const newHash = await bcrypt.hash(newPassword, 12);

        // Update password and invalidate the token
        await pool.query(
            "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
            [newHash, resetRecord.user_id]
        );

        await pool.query(
            "UPDATE password_resets SET used = true WHERE id = $1",
            [resetRecord.id]
        );

        return res.json({
            message: "Password has been reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        console.error("Password reset failed:", error.message);
        return res.status(500).json({ message: "Password reset failed" });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};
// Handles user registration and login.
const bcrypt    = require("bcrypt");
const jwt       = require("jsonwebtoken");
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

module.exports = { register, login };
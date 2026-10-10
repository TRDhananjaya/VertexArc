// Configures Express middleware and mounts all routes. Server startup is in server.js.
const express = require("express");
// Configure security-related HTTP response headers
const helmet = require("helmet");

const pool    = require("./db");

const authRoutes    = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

const { authenticateToken, requireRole } = require("./middleware/authMiddleware");

const app = express();
// Apply security headers to all API responses
app.use(helmet());

app.use(express.json()); // Parse JSON request bodies

// Public routes — no authentication required
app.use("/api/auth", authRoutes);

// Project routes — authentication is enforced inside the router
app.use("/api/projects", projectRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "VertexArc API is running" });
});

// Admin-only — returns all users (password_hash excluded)
app.get("/api/users", authenticateToken, requireRole("ADMIN"), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, is_active,
                   created_at, updated_at
            FROM users
            ORDER BY id
        `);

        res.json({ users: result.rows });
    } catch (error) {
        console.error("Failed to retrieve users:", error.message);
        res.status(500).json({ message: "Failed to retrieve users" });
    }
});

module.exports = app;

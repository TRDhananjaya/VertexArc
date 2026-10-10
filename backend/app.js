// Configures Express middleware and mounts all routes. Server startup is in server.js.
const express = require("express");
const pool    = require("./db");

const authRoutes    = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

const { authenticateToken, requireRole } = require("./middleware/authMiddleware");

const app = express();

app.use(express.json()); // Parse JSON request bodies

// Public routes — no authentication required
app.use("/api/auth", authRoutes);

// Project routes — authentication is enforced inside the router
app.use("/api/projects", projectRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "VertexArc API is running" });
});

// Protected tasks placeholder — requires a valid JWT
app.get("/api/tasks", authenticateToken, (req, res) => {
    res.json({ message: "Tasks retrieved successfully", tasks: [] });
});

// Database connectivity test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS time"
        );

        res.json({
            message:  "Database connection successful",
            database: result.rows[0].database,
            time:     result.rows[0].time,
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        res.status(500).json({ message: "Database connection failed" });
    }
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

// Configures Express middleware and routes. Server startup is handled in server.js.
const express = require("express");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/auth", authRoutes); // POST /api/auth/register, /api/auth/login

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "VertexArc API is running"
    });
});

// Placeholder — returns empty tasks until the feature is built
app.get("/api/tasks", (req, res) => {
    res.json({
        message: "Tasks retrieved successfully",
        tasks: []
    });
});

// Verifies the database connection is alive
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS time"
        );

        res.json({
            message: "Database connection successful",
            database: result.rows[0].database,
            time: result.rows[0].time
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Returns all users — IMPORTANT: still public, must be protected before production
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, role, is_active,
                   created_at, updated_at
            FROM users
            ORDER BY id;
        `);

        res.json({
            users: result.rows
        });
    } catch (error) {
        console.error("Failed to retrieve users:", error.message);

        res.status(500).json({
            message: "Failed to retrieve users"
        });
    }
});

module.exports = app;
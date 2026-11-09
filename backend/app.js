// Configures Express middleware and mounts all routes. Server startup is in server.js.
const express = require("express");
// Configure security-related HTTP response headers
const helmet = require("helmet");

// CORS is needed so the React frontend can call the backend API
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const adminAuditRoutes = require("./routes/adminAuditRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Allow the local React frontend to call our backend API
app.use(cors({
    origin: "http://localhost:5173"
}));

// Apply security headers to all API responses
app.use(helmet());

app.use(express.json()); // Parse JSON request bodies

// Public routes — no authentication required
app.use("/api/auth", authRoutes);

// Project routes — authentication is enforced inside the router
app.use("/api/projects", projectRoutes);

// Administrative access to project and task audit history
app.use("/api/admin/audit-logs", adminAuditRoutes);

app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "VertexArc API is running" });
});


module.exports = app;

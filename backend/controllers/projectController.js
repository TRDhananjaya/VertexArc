// Handles project creation and retrieval.
const projectModel = require("../models/projectModel");

// POST /api/projects — validate input and create a new project
async function createProject(req, res) {
    try {
        const { name, description = "" } = req.body ?? {};

        // Validate project name
        if (
            typeof name !== "string" ||
            name.trim().length === 0 ||
            name.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Project name must be between 1 and 150 characters",
            });
        }

        // Validate optional description
        if (typeof description !== "string" || description.length > 5000) {
            return res.status(400).json({
                message: "Description must not exceed 5000 characters",
            });
        }

        // req.user is set by authenticateToken middleware
        const project = await projectModel.createProject({
            name:        name.trim(),
            description: description.trim(),
            userId:      req.user.id,
        });

        return res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.error("Project creation failed:", error.message);
        return res.status(500).json({ message: "Failed to create project" });
    }
}

// GET /api/projects — admins see all projects; others see only their own
async function getProjects(req, res) {
    try {
        const isAdmin  = req.user.role === "ADMIN";
        const projects = await projectModel.getProjectsForUser(req.user.id, isAdmin);

        return res.status(200).json({ projects });
    } catch (error) {
        console.error("Failed to retrieve projects:", error.message);
        return res.status(500).json({ message: "Failed to retrieve projects" });
    }
}

module.exports = { createProject, getProjects };

// Handles project requests and validates user permissions.
const projectModel = require("../models/projectModel");
const userModel = require("../models/userModel");

// Check whether an ID fits PostgreSQL's positive INTEGER range
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number(id) <= 2147483647;
}

// Check whether the user can manage this project
function canManageProject(user, project) {
    return (
        user.role === "ADMIN" ||
        (
            user.role === "PROJECT_MANAGER" &&
            Number(project.created_by) === Number(user.id)
        )
    );
}

// POST /api/projects — create a new project
async function createProject(req, res) {
    try {
        const { name, description = "" } = req.body ?? {};

        if (
            typeof name !== "string" ||
            name.trim().length === 0 ||
            name.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Project name must be between 1 and 150 characters"
            });
        }

        if (
            typeof description !== "string" ||
            description.length > 5000
        ) {
            return res.status(400).json({
                message: "Description must not exceed 5000 characters"
            });
        }

        const project = await projectModel.createProject({
            name: name.trim(),
            description: description.trim(),
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error) {
        console.error("Project creation failed:", error.message);

        return res.status(500).json({
            message: "Failed to create project"
        });
    }
}

// GET /api/projects — list projects visible to the user
async function getProjects(req, res) {
    try {
        const isAdmin = req.user.role === "ADMIN";

        const projects = await projectModel.getProjectsForUser(
            req.user.id,
            isAdmin
        );

        return res.status(200).json({ projects });
    } catch (error) {
        console.error("Failed to retrieve projects:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve projects"
        });
    }
}

// GET /api/projects/:projectId/members — view project members
async function getMembers(req, res) {
    try {
        const { projectId } = req.params;

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Admins can view any project; other users must be members
        if (req.user.role !== "ADMIN") {
            const isMember = await projectModel.isProjectMember(
                projectId,
                req.user.id
            );

            if (!isMember) {
                return res.status(403).json({
                    message: "You cannot access this project's members"
                });
            }
        }

        const members = await projectModel.getMembersForProject(
            projectId
        );

        return res.status(200).json({ members });
    } catch (error) {
        console.error("Failed to retrieve members:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve members"
        });
    }
}

// POST /api/projects/:projectId/members — add a project member
async function addMember(req, res) {
    try {
        const { projectId } = req.params;
        const { userId } = req.body ?? {};

        if (!isValidId(projectId) || !isValidId(userId)) {
            return res.status(400).json({
                message: "Valid projectId and userId are required"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        // Only admins or the Project Manager who created the project
        // can add new members.
        if (!canManageProject(req.user, project)) {
            return res.status(403).json({
                message: "You cannot manage this project"
            });
        }

        const user = await userModel.findUserById(userId);

        if (!user || !user.is_active) {
            return res.status(404).json({
                message: "Active user not found"
            });
        }

        const alreadyMember = await projectModel.isProjectMember(
            projectId,
            userId
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "User is already a project member"
            });
        }

        const member = await projectModel.addMemberToProject(
            projectId,
            userId
        );

        // The project might have been deleted after our initial lookup
        if (!member) {
            return res.status(404).json({
                message: "Project not found or has been deleted"
            });
        }

        return res.status(201).json({
            message: "Member added successfully",
            member
        });
    } catch (error) {
        // Handle duplicate memberships from simultaneous requests
        if (error.code === "23505") {
            return res.status(409).json({
                message: "User is already a project member"
            });
        }

        console.error("Failed to add member:", error.message);

        return res.status(500).json({
            message: "Failed to add member"
        });
    }
}

// PATCH /api/projects/:projectId — edit project details
async function updateProject(req, res) {
    try {
        const { projectId } = req.params;
        const { name, description = "" } = req.body ?? {};

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        if (
            typeof name !== "string" ||
            name.trim().length === 0 ||
            name.trim().length > 150
        ) {
            return res.status(400).json({
                message: "Project name must be between 1 and 150 characters"
            });
        }

        if (
            typeof description !== "string" ||
            description.length > 5000
        ) {
            return res.status(400).json({
                message: "Description must not exceed 5000 characters"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!canManageProject(req.user, project)) {
            return res.status(403).json({
                message: "You cannot edit this project"
            });
        }

        const updatedProject = await projectModel.updateProjectDetails(
            projectId,
            name.trim(),
            description.trim(),
            req.user.id
        );

        if (!updatedProject) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error) {
        console.error("Update project error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// DELETE /api/projects/:projectId — soft-delete a project
async function deleteProject(req, res) {
    try {
        const { projectId } = req.params;

        if (!isValidId(projectId)) {
            return res.status(400).json({
                message: "Invalid project ID"
            });
        }

        const project = await projectModel.findProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!canManageProject(req.user, project)) {
            return res.status(403).json({
                message: "You cannot delete this project"
            });
        }

        // Mark the project as deleted instead of removing its records
        const deletedProject = await projectModel.softDeleteProject(
            projectId,
            req.user.id
        );

        if (!deletedProject) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            message: "Project deleted successfully",
            project: deletedProject
        });
    } catch (error) {
        console.error("Delete project error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createProject,
    getProjects,
    getMembers,
    addMember,
    updateProject,
    deleteProject
};

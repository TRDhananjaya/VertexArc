const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/userModel", () => ({
    findUserById: jest.fn()
}));

jest.mock("../models/projectModel", () => ({
    findProjectById: jest.fn(),
    updateProjectDetails: jest.fn(),
    softDeleteProject: jest.fn()
}));

const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");

// Create a token for a test user
function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET
    );
}

beforeEach(() => {
    jest.resetAllMocks();
});

// A project creator can edit their own project
test("Project creator can edit their project", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    projectModel.updateProjectDetails.mockResolvedValue({
        id: 1,
        name: "Updated Project",
        description: "Updated description"
    });

    const response = await request(app)
        .patch("/api/projects/1")
        .set("Authorization", `Bearer ${createToken(2)}`)
        .send({
            name: "Updated Project",
            description: "Updated description"
        });

    expect(response.status).toBe(200);
    expect(projectModel.updateProjectDetails).toHaveBeenCalled();
});

// A developer cannot edit a project
test("Developer cannot edit a project", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 3,
        role: "DEVELOPER",
        is_active: true
    });

    const response = await request(app)
        .patch("/api/projects/1")
        .set("Authorization", `Bearer ${createToken(3)}`)
        .send({
            name: "Unauthorized change"
        });

    expect(response.status).toBe(403);
    expect(projectModel.updateProjectDetails).not.toHaveBeenCalled();
});

// A project creator can soft-delete their own project
test("Project creator can delete their project", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    projectModel.softDeleteProject.mockResolvedValue({
        id: 1,
        name: "Example Project",
        deleted_at: new Date().toISOString()
    });

    const response = await request(app)
        .delete("/api/projects/1")
        .set("Authorization", `Bearer ${createToken(2)}`);

    expect(response.status).toBe(200);
    expect(projectModel.softDeleteProject).toHaveBeenCalledWith("1");
});

// A different project manager cannot delete another creator's project
test("Another project manager cannot delete the project", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 4,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    const response = await request(app)
        .delete("/api/projects/1")
        .set("Authorization", `Bearer ${createToken(4)}`);

    expect(response.status).toBe(403);
    expect(projectModel.softDeleteProject).not.toHaveBeenCalled();
});

// Deleted projects cannot be deleted a second time
test("Deleting a missing project returns 404", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 1,
        role: "ADMIN",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue(null);

    const response = await request(app)
        .delete("/api/projects/1")
        .set("Authorization", `Bearer ${createToken(1)}`);

    expect(response.status).toBe(404);
});

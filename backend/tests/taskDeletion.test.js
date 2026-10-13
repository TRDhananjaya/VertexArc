const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/userModel", () => ({
    findUserById: jest.fn()
}));

jest.mock("../models/projectModel", () => ({
    findProjectById: jest.fn()
}));

jest.mock("../models/taskModel", () => ({
    softDeleteTask: jest.fn()
}));

const userModel = require("../models/userModel");
const projectModel = require("../models/projectModel");
const taskModel = require("../models/taskModel");

// Generate a valid JWT for a test user
function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET
    );
}

beforeEach(() => {
    jest.resetAllMocks();
});

// The creator of a project can delete its tasks
test("Project creator can soft-delete a task", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    taskModel.softDeleteTask.mockResolvedValue({
        id: 5,
        project_id: 1,
        title: "Example Task",
        deleted_at: new Date().toISOString()
    });

    const response = await request(app)
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(2)}`);

    expect(response.status).toBe(200);
    expect(taskModel.softDeleteTask).toHaveBeenCalledWith("5", "1",2);
});

// Developers cannot delete tasks
test("Developer cannot delete tasks", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 3,
        role: "DEVELOPER",
        is_active: true
    });

    const response = await request(app)
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(3)}`);

    expect(response.status).toBe(403);
    expect(taskModel.softDeleteTask).not.toHaveBeenCalled();
});

// A different project manager cannot delete another creator's task
test("Another project manager cannot delete tasks", async () => {
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
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(4)}`);

    expect(response.status).toBe(403);
    expect(taskModel.softDeleteTask).not.toHaveBeenCalled();
});

// Admins can delete tasks in any active project
test("Admin can soft-delete a task", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 1,
        role: "ADMIN",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    taskModel.softDeleteTask.mockResolvedValue({
        id: 5,
        project_id: 1,
        deleted_at: new Date().toISOString()
    });

    const response = await request(app)
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(1)}`);

    expect(response.status).toBe(200);
});

// A task that has already been deleted cannot be deleted again
test("Deleting an already deleted task returns 404", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue({
        id: 1,
        created_by: 2
    });

    taskModel.softDeleteTask.mockResolvedValue(null);

    const response = await request(app)
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(2)}`);

    expect(response.status).toBe(404);
});

// Tasks cannot be deleted through a missing or deleted project
test("Deleting a task in a missing project returns 404", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    projectModel.findProjectById.mockResolvedValue(null);

    const response = await request(app)
        .delete("/api/projects/1/tasks/5")
        .set("Authorization", `Bearer ${createToken(2)}`);

    expect(response.status).toBe(404);
    expect(taskModel.softDeleteTask).not.toHaveBeenCalled();
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");

jest.mock("../models/userModel", () => ({
    findUserById: jest.fn()
}));

jest.mock("../models/adminAuditModel", () => ({
    getProjectAuditLogs: jest.fn(),
    getTaskAuditLogs: jest.fn()
}));

const userModel = require("../models/userModel");
const adminAuditModel = require("../models/adminAuditModel");

// Generate a test token using the configured test secret
function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET
    );
}

beforeEach(() => {
    jest.resetAllMocks();
});

// Admins can view project audit logs
test("Admin can view project audit history", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 1,
        role: "ADMIN",
        is_active: true
    });

    adminAuditModel.getProjectAuditLogs.mockResolvedValue([
        {
            id: 1,
            project_id: 2,
            actor_id: 6,
            action: "PROJECT_DELETED"
        }
    ]);

    const response = await request(app)
        .get("/api/admin/audit-logs/projects")
        .set("Authorization", `Bearer ${createToken(1)}`);

    expect(response.status).toBe(200);
    expect(response.body.auditLogs).toHaveLength(1);
    expect(adminAuditModel.getProjectAuditLogs).toHaveBeenCalledTimes(1);
});

// Admins can view task audit logs
test("Admin can view task audit history", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 1,
        role: "ADMIN",
        is_active: true
    });

    adminAuditModel.getTaskAuditLogs.mockResolvedValue([]);

    const response = await request(app)
        .get("/api/admin/audit-logs/tasks")
        .set("Authorization", `Bearer ${createToken(1)}`);

    expect(response.status).toBe(200);
    expect(response.body.auditLogs).toEqual([]);
});

// Project Managers cannot view global audit history
test("Project Manager cannot view admin audit history", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 2,
        role: "PROJECT_MANAGER",
        is_active: true
    });

    const response = await request(app)
        .get("/api/admin/audit-logs/projects")
        .set("Authorization", `Bearer ${createToken(2)}`);

    expect(response.status).toBe(403);
    expect(adminAuditModel.getProjectAuditLogs).not.toHaveBeenCalled();
});

// Developers cannot view global audit history
test("Developer cannot view admin audit history", async () => {
    userModel.findUserById.mockResolvedValue({
        id: 3,
        role: "DEVELOPER",
        is_active: true
    });

    const response = await request(app)
        .get("/api/admin/audit-logs/tasks")
        .set("Authorization", `Bearer ${createToken(3)}`);

    expect(response.status).toBe(403);
    expect(adminAuditModel.getTaskAuditLogs).not.toHaveBeenCalled();
});

// Requests without authentication are rejected
test("Unauthenticated users cannot view audit history", async () => {
    const response = await request(app)
        .get("/api/admin/audit-logs/projects");

    expect(response.status).toBe(401);
    expect(adminAuditModel.getProjectAuditLogs).not.toHaveBeenCalled();
});

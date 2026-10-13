const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock database access so tests don't change real records
jest.mock("../db", () => ({
    query: jest.fn()
}));

// Mock user lookups independently from database queries
jest.mock("../models/userModel", () => ({
    findUserById: jest.fn()
}));

const pool = require("../db");
const userModel = require("../models/userModel");
const app = require("../app");

// Generate JWTs using the payload expected by authMiddleware
function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// Simulate an authenticated user without querying PostgreSQL
function mockUser(user) {
    userModel.findUserById.mockResolvedValue(user);
}

describe("VertexArc Project Authorization", () => {

    beforeEach(() => {
        // Reset mock calls and responses before each test
        jest.resetAllMocks();
    });

    test("Developer cannot access a project they don't belong to", async () => {
        const developer = {
            id: 3,
            name: "Test Developer",
            email: "developer@example.com",
            role: "DEVELOPER",
            is_active: true
        };

        // Authenticate the developer
        mockUser(developer);

        // Return the project, then indicate no membership exists
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 2,
                    name: "Private Project",
                    created_by: 1
                }]
            })
            .mockResolvedValueOnce({
                rows: []
            });

        const response = await request(app)
            .get("/api/projects/2/members")
            .set("Authorization", `Bearer ${createToken(3)}`);

        expect(response.status).toBe(403);
    });

    test("Developer cannot view tasks in another project", async () => {
        const developer = {
            id: 3,
            name: "Test Developer",
            email: "developer@example.com",
            role: "DEVELOPER",
            is_active: true
        };

        // Authenticate the developer
        mockUser(developer);

        // Return the project, then indicate no membership exists
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 2,
                    name: "Private Project",
                    created_by: 1
                }]
            })
            .mockResolvedValueOnce({
                rows: []
            });

        const response = await request(app)
            .get("/api/projects/2/tasks")
            .set("Authorization", `Bearer ${createToken(3)}`);

        expect(response.status).toBe(403);
    });

    test("Developer cannot create tasks", async () => {
        const developer = {
            id: 3,
            name: "Test Developer",
            email: "developer@example.com",
            role: "DEVELOPER",
            is_active: true
        };

        // Authenticate the developer
        mockUser(developer);

        const response = await request(app)
            .post("/api/projects/1/tasks")
            .set("Authorization", `Bearer ${createToken(3)}`)
            .send({
                title: "Unauthorized Task",
                priority: "HIGH"
            });

        expect(response.status).toBe(403);
    });

    test("Developer cannot assign tasks", async () => {
        const developer = {
            id: 3,
            name: "Test Developer",
            email: "developer@example.com",
            role: "DEVELOPER",
            is_active: true
        };

        // Authenticate the developer
        mockUser(developer);

        const response = await request(app)
            .patch("/api/projects/1/tasks/1/assign")
            .set("Authorization", `Bearer ${createToken(3)}`)
            .send({
                userId: 4
            });

        expect(response.status).toBe(403);
    });

    test("Admin can view project members without membership", async () => {
        const admin = {
            id: 1,
            name: "Test Admin",
            email: "admin@example.com",
            role: "ADMIN",
            is_active: true
        };

        // Authenticate the Admin
        mockUser(admin);

        // Return the project and an empty members list
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 2,
                    name: "Private Project",
                    created_by: 5
                }]
            })
            .mockResolvedValueOnce({
                rows: []
            });

        const response = await request(app)
            .get("/api/projects/2/members")
            .set("Authorization", `Bearer ${createToken(1)}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("members");
        expect(Array.isArray(response.body.members)).toBe(true);
    });

});

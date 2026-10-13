const request = require("supertest");

// Replace database access with controlled test responses
jest.mock("../db", () => ({
    query: jest.fn()
}));

const pool = require("../db");
const app = require("../app");

describe("VertexArc Role-Based Authorization", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Developer cannot create a project", async () => {
        // Simulate the authenticated user's database record
        pool.query.mockResolvedValue({
            rows: [{
                id: 3,
                name: "Test Developer",
                email: "developer@example.com",
                role: "DEVELOPER",
                is_active: true
            }]
        });

        const jwt = require("jsonwebtoken");

        // Use the same JWT payload structure as the real authentication system
        const token = jwt.sign(
            { userId: 3 },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const response = await request(app)
            .post("/api/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Unauthorized Project",
                description: "This should be rejected"
            });

        expect(response.status).toBe(403);
    });

});

const request = require("supertest");
const app = require("../app");

// Test authentication and access to protected endpoints
describe("VertexArc Authentication Security", () => {

    test("GET /api/projects rejects requests without a JWT", async () => {
        const response = await request(app)
            .get("/api/projects");

        expect(response.status).toBe(401);
    });

    test("GET /api/projects rejects an invalid JWT", async () => {
        const response = await request(app)
            .get("/api/projects")
            .set("Authorization", "Bearer invalid-token");

        expect(response.status).toBe(401);
    });

    test("GET /api/projects rejects a malformed Authorization header", async () => {
        const response = await request(app)
            .get("/api/projects")
            .set("Authorization", "invalid-token");

        expect(response.status).toBe(401);
    });

    test("GET /api/projects/:projectId/tasks requires authentication", async () => {
        const response = await request(app)
            .get("/api/projects/1/tasks");

        expect(response.status).toBe(401);
    });

    // Check that security headers are included in API responses
    test("API responses include Helmet security headers", async () => {
        const response = await request(app)
            .get("/api/projects");

        expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

});

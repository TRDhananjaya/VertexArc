const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");
const app = require("../app");

describe("VertexArc User Management & Status Authorization", () => {
  const adminToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "test-secret-key-for-vertexarc-ci", {
    expiresIn: "1h"
  });

  const devToken = jwt.sign({ userId: 4 }, process.env.JWT_SECRET || "test-secret-key-for-vertexarc-ci", {
    expiresIn: "1h"
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Admin can update user name, email, and role", async () => {
    // 1. Authenticate admin user (id = 1)
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      })
      // 2. Target user lookup (id = 4)
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
      })
      // 3. Email uniqueness check
      .mockResolvedValueOnce({ rows: [] })
      // 4. Update query
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: "Charlie Senior", email: "charlie.sr@vertexarc.com", role: "PROJECT_MANAGER", is_active: true }]
      });

    const response = await request(app)
      .patch("/api/users/4")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Charlie Senior",
        email: "charlie.sr@vertexarc.com",
        role: "PROJECT_MANAGER"
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User updated successfully");
    expect(response.body.user.role).toBe("PROJECT_MANAGER");
  });

  test("Admin can deactivate and activate a user", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: false }]
      });

    const response = await request(app)
      .patch("/api/users/4")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(200);
    expect(response.body.user.is_active).toBe(false);
  });

  test("Admin cannot deactivate their own account", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      });

    const response = await request(app)
      .patch("/api/users/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_active: false });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/cannot deactivate your own account/i);
  });

  test("Admin cannot demote their own account", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: "Admin", email: "admin@vertexarc.com", role: "ADMIN", is_active: true }]
      });

    const response = await request(app)
      .patch("/api/users/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "DEVELOPER" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/cannot demote your own administrator account/i);
  });

  test("Developer cannot update users", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
    });

    const response = await request(app)
      .patch("/api/users/4")
      .set("Authorization", `Bearer ${devToken}`)
      .send({ name: "Hacked Name" });

    expect(response.status).toBe(403);
  });
});

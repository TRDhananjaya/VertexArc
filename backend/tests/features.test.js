const request = require("supertest");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

jest.mock("../db", () => ({
  query: jest.fn()
}));

const pool = require("../db");
const app = require("../app");

describe("Profile, Notifications, and Password Reset Features", () => {
  const userToken = jwt.sign({ userId: 4 }, process.env.JWT_SECRET || "test-secret-key-for-vertexarc-ci", {
    expiresIn: "1h"
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. User Profile & Password Change", () => {
    test("User can retrieve their own profile", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe("Dev Charlie");
    });

    test("User can update their display name", async () => {
      // 1. authenticateToken
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
        })
        // 2. update query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Charlie Updated", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
        });

      const response = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Charlie Updated" });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/profile updated successfully/i);
      expect(response.body.user.name).toBe("Charlie Updated");
    });

    test("Changing password requires valid current password", async () => {
      const hashedOldPassword = await bcrypt.hash("correct-pass-123", 10);

      // 1. authenticateToken
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
        })
        // 2. fetch password hash
        .mockResolvedValueOnce({
          rows: [{ password_hash: hashedOldPassword }]
        });

      const response = await request(app)
        .patch("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          currentPassword: "wrong-password",
          newPassword: "new-password-123"
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/current password is incorrect/i);
    });
  });

  describe("2. In-App Notification Center", () => {
    test("User can retrieve their notifications and unread count", async () => {
      // 1. authenticateToken
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
        })
        // 2. getNotificationsByUser
        .mockResolvedValueOnce({
          rows: [
            { id: 1, user_id: 4, title: "Task Assigned", message: "Task #1 assigned", is_read: false },
            { id: 2, user_id: 4, title: "Security Review", message: "Review passed", is_read: true }
          ]
        })
        // 3. getUnreadCountByUser
        .mockResolvedValueOnce({
          rows: [{ unread: 1 }]
        });

      const response = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notifications).toHaveLength(2);
      expect(response.body.unreadCount).toBe(1);
    });

    test("User can mark a notification as read", async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER", is_active: true }]
        })
        .mockResolvedValueOnce({
          rows: [{ id: 1, is_read: true }]
        });

      const response = await request(app)
        .patch("/api/notifications/1/read")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notification.is_read).toBe(true);
    });
  });

  describe("3. Forgot Password Flow", () => {
    test("Forgot password returns generic confirmation to prevent user enumeration", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // user not found

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@vertexarc.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/if an account with that email exists/i);
    });

    test("Existing user gets a reset token generated", async () => {
      // find user
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", is_active: true }]
        })
        // insert into password_resets
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "dev1@vertexarc.com" });

      expect(response.status).toBe(200);
      expect(response.body.resetToken).toBeDefined();
    });

    test("Reset password with valid token updates password", async () => {
      const sampleToken = "sample-valid-hex-token-12345";
      pool.query
        // lookup token in password_resets
        .mockResolvedValueOnce({
          rows: [{ id: 1, user_id: 4, expires_at: new Date(Date.now() + 100000), used: false }]
        })
        // update users table
        .mockResolvedValueOnce({ rows: [] })
        // mark token used
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: sampleToken,
          newPassword: "BrandNewSecurePassword123"
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/password has been reset successfully/i);
    });
  });
});

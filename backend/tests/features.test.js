const request = require("supertest");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

jest.mock("../db", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

// Mock email service so tests never make real Brevo API calls
jest.mock("../emailService", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

const pool = require("../db");
const { sendPasswordResetEmail } = require("../emailService");
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
    const originalPasswordResetFlag = process.env.PASSWORD_RESET_ENABLED;

    afterEach(() => {
      if (originalPasswordResetFlag === undefined) {
        delete process.env.PASSWORD_RESET_ENABLED;
      } else {
        process.env.PASSWORD_RESET_ENABLED = originalPasswordResetFlag;
      }
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("Password recovery endpoints are disabled (503) until email delivery is configured", async () => {
      delete process.env.PASSWORD_RESET_ENABLED;

      const forgotRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "dev1@vertexarc.com" });

      expect(forgotRes.status).toBe(503);
      expect(forgotRes.body.resetToken).toBeUndefined();

      const resetRes = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "any-token", newPassword: "BrandNewSecurePassword123" });

      expect(resetRes.status).toBe(503);
    });

    test("When enabled, forgot password returns generic confirmation and never exposes resetToken", async () => {
      process.env.PASSWORD_RESET_ENABLED = "true";

      // 1. Unknown user
      pool.query.mockResolvedValueOnce({ rows: [] });
      const unknownRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@vertexarc.com" });

      expect(unknownRes.status).toBe(200);
      expect(unknownRes.body.message).toMatch(/if an account with that email exists/i);
      expect(unknownRes.body.resetToken).toBeUndefined();

      // 2. Existing active user
      pool.query
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "Dev Charlie", email: "dev1@vertexarc.com", is_active: true }]
        })
        .mockResolvedValueOnce({ rows: [] });

      const knownRes = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "dev1@vertexarc.com" });

      expect(knownRes.status).toBe(200);
      expect(knownRes.body.message).toMatch(/if an account with that email exists/i);
      expect(knownRes.body.resetToken).toBeUndefined();
      // Email service must have been called with the user's address — token stays in email only
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "dev1@vertexarc.com" })
      );
    });

    test("When enabled, reset password runs atomically in a transaction and updates password", async () => {
      process.env.PASSWORD_RESET_ENABLED = "true";
      const sampleToken = "sample-valid-hex-token-12345";

      const mockClient = {
        query: jest.fn(async (sql) => {
          const stmt = String(sql).trim();
          if (stmt === "BEGIN" || stmt === "COMMIT" || stmt === "ROLLBACK") {
            return { rows: [] };
          }
          if (stmt.startsWith("SELECT") && stmt.includes("FROM password_resets")) {
            return {
              rows: [{ id: 1, user_id: 4, expires_at: new Date(Date.now() + 100000), used: false }]
            };
          }
          if (stmt.startsWith("UPDATE users") || stmt.startsWith("UPDATE password_resets")) {
            return { rows: [] };
          }
          throw new Error(`Unexpected SQL: ${stmt}`);
        }),
        release: jest.fn()
      };

      pool.connect.mockResolvedValueOnce(mockClient);

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: sampleToken,
          newPassword: "BrandNewSecurePassword123"
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/password has been reset successfully/i);
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});

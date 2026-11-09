const bcrypt = require("bcrypt");
const pool = require("../db");
const userModel = require("../models/userModel");

// GET /api/users - Admin only
async function listUsers(req, res) {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, is_active,
             created_at, updated_at
      FROM users
      ORDER BY id
    `);

    return res.json({ users: result.rows });
  } catch (error) {
    console.error("Failed to retrieve users:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve users"
    });
  }
}

// POST /api/users - Admin only
async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Name must be between 1 and 100 characters"
      });
    }

    if (
      typeof email !== "string" ||
      email.trim().length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Password must be 8 characters or more and at most 72 UTF-8 bytes"
      });
    }

    // Admins cannot create additional Admin accounts here.
    const allowedRoles = ["DEVELOPER", "PROJECT_MANAGER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Role must be DEVELOPER or PROJECT_MANAGER"
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser =
      await userModel.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // Never store a plaintext password.
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await userModel.createUserWithRole({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role
    });

    // The returned user does not contain password_hash.
    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    console.error("User creation failed:", error.message);

    return res.status(500).json({
      message: "Failed to create user"
    });
  }
}

module.exports = {
  listUsers,
  createUser
};

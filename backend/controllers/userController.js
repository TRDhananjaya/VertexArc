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

// PATCH/PUT /api/users/:id - Admin only
async function updateUser(req, res) {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetUser = await userModel.findUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, role, isActive, is_active } = req.body ?? {};

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
        return res.status(400).json({
          message: "Name must be between 1 and 100 characters"
        });
      }
    }

    // Validate email if provided
    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        email.trim().length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          message: "Please provide a valid email address"
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await userModel.findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== targetId) {
        return res.status(409).json({
          message: "Email is already registered"
        });
      }
    }

    // Validate role if provided
    const allowedRoles = ["ADMIN", "PROJECT_MANAGER", "DEVELOPER"];
    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Role must be ADMIN, PROJECT_MANAGER, or DEVELOPER"
        });
      }

      // Security check: An admin cannot demote their own account
      if (targetId === req.user.id && role !== "ADMIN") {
        return res.status(400).json({
          message: "You cannot demote your own administrator account"
        });
      }
    }

    // Validate active status if provided
    const activeStatus = isActive !== undefined ? isActive : is_active;
    if (activeStatus !== undefined) {
      if (typeof activeStatus !== "boolean") {
        return res.status(400).json({
          message: "Active status must be a boolean"
        });
      }

      // Security check: An admin cannot deactivate their own account
      if (targetId === req.user.id && activeStatus === false) {
        return res.status(400).json({
          message: "You cannot deactivate your own account"
        });
      }
    }

    const updated = await userModel.updateUser(targetId, {
      name: name !== undefined ? name.trim() : undefined,
      email: email !== undefined ? email.trim().toLowerCase() : undefined,
      role,
      isActive: activeStatus
    });

    return res.json({
      message: "User updated successfully",
      user: updated
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    console.error("User update failed:", error.message);
    return res.status(500).json({
      message: "Failed to update user"
    });
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser
};

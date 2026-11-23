// Database queries for the users table.
const pool = require("../db");

// Find a user by email — used for login and duplicate checks during registration.
// Returns the full row including password_hash (needed for bcrypt comparison).
async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, is_active, avatar_url
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}

// Find a user by ID — used by authenticateToken to validate the token's userId.
async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, name, email, role, is_active, avatar_url
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

// Insert a new user and return the created record (password_hash excluded).
async function createUser({ name, email, passwordHash }) {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, role, is_active, created_at`,
        [name, email, passwordHash]
    );

    return result.rows[0];
}

async function createUserWithRole({
  name,
  email,
  passwordHash,
  role
}) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, passwordHash, role]
  );

  return result.rows[0];
}

async function updateUser(id, { name, email, role, isActive, avatarUrl }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(email);
  }
  if (role !== undefined) {
    fields.push(`role = $${paramIndex++}`);
    values.push(role);
  }
  if (isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }
  if (avatarUrl !== undefined) {
    fields.push(`avatar_url = $${paramIndex++}`);
    values.push(avatarUrl);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, name, email, role, is_active, avatar_url, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

module.exports = { 
    findUserByEmail, 
    findUserById, 
    createUser,
    createUserWithRole,
    updateUser
};
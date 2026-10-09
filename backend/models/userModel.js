// Database queries for the users table.
const pool = require("../db");

// Find a user by email — used for login and duplicate checks during registration.
// Returns the full row including password_hash (needed for bcrypt comparison).
async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, is_active
         FROM users
         WHERE email = $1`,
        [email] // parameterized query — prevents SQL injection
    );

    return result.rows[0] || null;
}

// Insert a new user and return the created record (excluding password_hash).
async function createUser({ name, email, passwordHash }) {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, role, is_active, created_at`,
        [name, email, passwordHash]
    );

    return result.rows[0];
}

module.exports = {
    findUserByEmail,
    createUser
};
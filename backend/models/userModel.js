const pool = require("../db");

// Find a user by email
async function findUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role, is_active
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
}

// Find a user by ID for authentication
async function findUserById(id) {
    const result = await pool.query(
        `SELECT id, name, email, role, is_active
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

// Create a new user
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
    findUserById,
    createUser
};
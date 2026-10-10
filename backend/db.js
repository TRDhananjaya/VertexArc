// Shared PostgreSQL connection pool — imported by models and routes.
const { Pool } = require("pg");

// Pool reuses connections across requests instead of creating a new one each time.
const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     process.env.DB_PORT,
});

module.exports = pool;
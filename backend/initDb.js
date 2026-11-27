if (require.main === module) {
  require("dotenv").config({ path: __dirname + "/.env" });
}

const pool = require("./db");

/**
 * Initializes the complete VertexArc PostgreSQL schema idempotently.
 * Safe to run on a fresh empty database (e.g., AWS RDS) or an existing database.
 * Rethrows errors so server startup fails fast if schema initialization fails.
 */
async function initDb() {
  try {
    await pool.query(`
      -- 1. Users
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'DEVELOPER'
          CHECK (role IN ('ADMIN', 'PROJECT_MANAGER', 'DEVELOPER')),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

      -- 2. Projects
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );

      -- 3. Project Members
      CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (project_id, user_id)
      );

      -- 4. Project Audit Logs
      CREATE TABLE IF NOT EXISTS project_audit_logs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id),
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL
          CHECK (action IN ('PROJECT_UPDATED', 'PROJECT_DELETED')),
        old_value JSONB,
        new_value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 5. Tasks
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'TODO'
          CHECK (status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
        priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
          CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        is_security_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
        risk_level VARCHAR(10),
        deleted_at TIMESTAMPTZ,
        CHECK (
          (is_security_sensitive = FALSE AND risk_level IS NULL) OR
          (is_security_sensitive = TRUE AND risk_level IN ('LOW', 'MEDIUM', 'HIGH'))
        )
      );

      -- 6. Task Security Reviews
      CREATE TABLE IF NOT EXISTS task_security_reviews (
        task_id INTEGER PRIMARY KEY REFERENCES tasks(id) ON DELETE CASCADE,
        code_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
        security_tests_passed BOOLEAN NOT NULL DEFAULT FALSE,
        no_unresolved_vulnerabilities BOOLEAN NOT NULL DEFAULT FALSE,
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 7. Task Comments
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL
          CHECK (char_length(TRIM(BOTH FROM content)) >= 1 AND char_length(TRIM(BOTH FROM content)) <= 2000),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 8. Task Audit Logs
      CREATE TABLE IF NOT EXISTS task_audit_logs (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL
          CHECK (action IN ('STATUS_CHANGED', 'SECURITY_REVIEW_UPDATED', 'SECURITY_REVIEW_RESET', 'TASK_DELETED')),
        old_value JSONB,
        new_value JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 9. Notifications
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        type VARCHAR(50) DEFAULT 'INFO',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
      ON notifications(user_id, is_read);

      -- 10. Password Resets
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_password_resets_token
      ON password_resets(token_hash, used);
    `);

    // Ensure users have an initial welcome notification if they have none
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, link, type, is_read, created_at)
      SELECT u.id, 'Welcome to VertexArc', 'Your workspace account is active. You will receive notifications here for task assignments, project updates, and security reviews.', '/dashboard', 'INFO', false, NOW()
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM notifications n WHERE n.user_id = u.id
      );
    `);
  } catch (err) {
    console.error("Database table initialization error:", err.message);
    throw err;
  }
}

if (require.main === module) {
  initDb()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}

module.exports = initDb;

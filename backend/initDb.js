require("dotenv").config({ path: __dirname + "/.env" });
const pool = require("./db");

async function initDb() {
  try {
    await pool.query(`
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
    console.log("Database tables verified: notifications, password_resets.");
  } catch (err) {
    console.error("Database table initialization error:", err.message);
  }
}

if (require.main === module) {
  require("dotenv").config({ path: __dirname + "/.env" });
  initDb().then(() => pool.end());
}

module.exports = initDb;

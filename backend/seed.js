require("dotenv").config({ path: __dirname + "/.env" });
const bcrypt = require("bcrypt");
const pool = require("./db");

// Guardrail: prevent destructive seeding against production or unintended databases
if (process.env.NODE_ENV === "production") {
  console.error("ABORTED: Seeding is strictly disabled in production environments.");
  process.exit(1);
}

if (process.env.ALLOW_DB_SEED !== "true") {
  console.error(
    "ABORTED: To prevent accidental data loss (TRUNCATE CASCADE), set ALLOW_DB_SEED=true before running this script."
  );
  process.exit(1);
}

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "password123";

const USERS = [
  // ID 1
  { name: "System Admin", email: "admin@vertexarc.com", role: "ADMIN" },
  // ID 2 & 3
  { name: "Alice Morgan (PM)", email: "pm1@vertexarc.com", role: "PROJECT_MANAGER" },
  { name: "Bob Vance (PM)", email: "pm2@vertexarc.com", role: "PROJECT_MANAGER" },
  // ID 4 to 8
  { name: "Dev Charlie", email: "dev1@vertexarc.com", role: "DEVELOPER" },
  { name: "Dev David", email: "dev2@vertexarc.com", role: "DEVELOPER" },
  { name: "Dev Emma", email: "dev3@vertexarc.com", role: "DEVELOPER" },
  { name: "Dev Frank", email: "dev4@vertexarc.com", role: "DEVELOPER" },
  { name: "Dev Grace", email: "dev5@vertexarc.com", role: "DEVELOPER" }
];

async function seedCompleteDatabase() {
  const client = await pool.connect();

  try {
    console.log("==========================================");
    console.log("VERTEXARC COMPREHENSIVE SEEDING");
    console.log("==========================================");

    await client.query("BEGIN");

    console.log("1. Cleaning all tables & restarting ID sequences...");
    await client.query(`
      TRUNCATE TABLE
        task_audit_logs,
        task_comments,
        task_security_reviews,
        tasks,
        project_members,
        project_audit_logs,
        projects,
        users
      RESTART IDENTITY CASCADE
    `);

    console.log("2. Generating bcrypt hash...");
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    console.log("3. Seeding users...");
    const userMap = {};
    for (const u of USERS) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         RETURNING id, name, email, role`,
        [u.name, u.email, passwordHash, u.role]
      );
      userMap[u.email] = res.rows[0];
    }

    console.log("4. Seeding projects & project audit logs...");
    const PROJECTS = [
      {
        name: "VertexArc Core Platform",
        description: "Centralized identity, role-based access control (RBAC), and security gate orchestration.",
        created_by: userMap["pm1@vertexarc.com"].id,
        members: [
          userMap["pm1@vertexarc.com"].id,
          userMap["dev1@vertexarc.com"].id,
          userMap["dev2@vertexarc.com"].id,
          userMap["dev3@vertexarc.com"].id
        ]
      },
      {
        name: "Cloud Infrastructure & Gateway",
        description: "Microservices routing, rate limiting middleware, automated CI/CD checks, and containerization.",
        created_by: userMap["pm2@vertexarc.com"].id,
        members: [
          userMap["pm2@vertexarc.com"].id,
          userMap["dev1@vertexarc.com"].id,
          userMap["dev4@vertexarc.com"].id,
          userMap["dev5@vertexarc.com"].id
        ]
      },
      {
        name: "Mobile Client API",
        description: "RESTful endpoints for cross-platform mobile client authentication, offline sync, and push alerts.",
        created_by: userMap["admin@vertexarc.com"].id,
        members: [
          userMap["admin@vertexarc.com"].id,
          userMap["pm1@vertexarc.com"].id,
          userMap["dev3@vertexarc.com"].id,
          userMap["dev5@vertexarc.com"].id
        ]
      }
    ];

    const projectMap = [];
    for (const p of PROJECTS) {
      const pRes = await client.query(
        `INSERT INTO projects (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING id, name, created_by`,
        [p.name, p.description, p.created_by]
      );
      const proj = pRes.rows[0];
      projectMap.push(proj);

      // Add members
      for (const mId of p.members) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [proj.id, mId]
        );
      }

      // Add Project Audit Log with allowed action 'PROJECT_UPDATED'
      await client.query(
        `INSERT INTO project_audit_logs (project_id, actor_id, action, old_value, new_value)
         VALUES ($1, $2, 'PROJECT_UPDATED', $3::jsonb, $4::jsonb)`,
        [
          proj.id,
          proj.created_by,
          JSON.stringify({ name: "Initial Draft", description: "Pending kickoff" }),
          JSON.stringify({ name: p.name, description: p.description })
        ]
      );
    }

    console.log("5. Seeding tasks, security reviews, comments & task audit logs...");

    // TASK LIST
    const TASKS = [
      // Project 1 Tasks
      {
        project_id: projectMap[0].id,
        title: "Implement OAuth2 / JWT Refresh Token Rotation",
        description: "Rotate short-lived access tokens and sign long-lived refresh tokens with HMAC SHA256.",
        priority: "HIGH",
        status: "IN_REVIEW",
        assigned_to: userMap["dev1@vertexarc.com"].id,
        created_by: userMap["pm1@vertexarc.com"].id,
        is_security_sensitive: true,
        risk_level: "HIGH",
        security_review: {
          code_reviewed: true,
          security_tests_passed: true,
          no_unresolved_vulnerabilities: false, // 2 of 3 checks passed (ready to test gate!)
          reviewed_by: userMap["pm1@vertexarc.com"].id
        },
        comments: [
          {
            user_id: userMap["dev1@vertexarc.com"].id,
            content: "I have finished rotating token signatures and added revocation blacklist tests. Please review the security checklist."
          },
          {
            user_id: userMap["pm1@vertexarc.com"].id,
            content: "Code and unit tests pass. Please check CVE scan report for dependency jsonwebtoken before I approve."
          }
        ],
        audit_history: [
          { action: "STATUS_CHANGED", old: { status: "TODO" }, new: { status: "IN_PROGRESS" }, actor: userMap["dev1@vertexarc.com"].id },
          { action: "STATUS_CHANGED", old: { status: "IN_PROGRESS" }, new: { status: "IN_REVIEW" }, actor: userMap["dev1@vertexarc.com"].id },
          { action: "SECURITY_REVIEW_UPDATED", old: { codeReviewed: false, securityTestsPassed: false, noUnresolvedVulnerabilities: false }, new: { codeReviewed: true, securityTestsPassed: true, noUnresolvedVulnerabilities: false }, actor: userMap["pm1@vertexarc.com"].id }
        ]
      },
      {
        project_id: projectMap[0].id,
        title: "Configure Argon2 / bcrypt password hashing cost factors",
        description: "Upgrade bcrypt cost factor to 12 (~300ms) with input length bounds to protect against DoS.",
        priority: "MEDIUM",
        status: "DONE",
        assigned_to: userMap["dev2@vertexarc.com"].id,
        created_by: userMap["pm1@vertexarc.com"].id,
        is_security_sensitive: true,
        risk_level: "MEDIUM",
        security_review: {
          code_reviewed: true,
          security_tests_passed: true,
          no_unresolved_vulnerabilities: true, // all passed!
          reviewed_by: userMap["pm1@vertexarc.com"].id
        },
        comments: [
          {
            user_id: userMap["dev2@vertexarc.com"].id,
            content: "Benchmark tests show ~280ms on development hardware. All criteria verified."
          }
        ],
        audit_history: [
          { action: "STATUS_CHANGED", old: { status: "TODO" }, new: { status: "IN_PROGRESS" }, actor: userMap["dev2@vertexarc.com"].id },
          { action: "STATUS_CHANGED", old: { status: "IN_PROGRESS" }, new: { status: "IN_REVIEW" }, actor: userMap["dev2@vertexarc.com"].id },
          { action: "SECURITY_REVIEW_UPDATED", old: { codeReviewed: false, securityTestsPassed: false, noUnresolvedVulnerabilities: false }, new: { codeReviewed: true, securityTestsPassed: true, noUnresolvedVulnerabilities: true }, actor: userMap["pm1@vertexarc.com"].id },
          { action: "STATUS_CHANGED", old: { status: "IN_REVIEW" }, new: { status: "DONE" }, actor: userMap["pm1@vertexarc.com"].id }
        ]
      },
      {
        project_id: projectMap[0].id,
        title: "Build User Management admin view with role filters",
        description: "Allow system administrators to view, search, and assign DEVELOPER / PROJECT_MANAGER roles.",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        assigned_to: userMap["dev3@vertexarc.com"].id,
        created_by: userMap["pm1@vertexarc.com"].id,
        is_security_sensitive: false,
        risk_level: null,
        comments: [
          {
            user_id: userMap["dev3@vertexarc.com"].id,
            content: "Drafting user table components in Tailwind CSS."
          }
        ],
        audit_history: [
          { action: "STATUS_CHANGED", old: { status: "TODO" }, new: { status: "IN_PROGRESS" }, actor: userMap["dev3@vertexarc.com"].id }
        ]
      },
      {
        project_id: projectMap[0].id,
        title: "Audit Log Export to CSV / JSON format",
        description: "Allow compliance officers to download signed activity audits for annual ISO27001 reviews.",
        priority: "LOW",
        status: "TODO",
        assigned_to: null,
        created_by: userMap["pm1@vertexarc.com"].id,
        is_security_sensitive: false,
        risk_level: null,
        comments: [],
        audit_history: []
      },

      // Project 2 Tasks
      {
        project_id: projectMap[1].id,
        title: "Setup Docker container isolation and rootless users",
        description: "Ensure container processes run under an unprivileged node user without host filesystem escape.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        assigned_to: userMap["dev4@vertexarc.com"].id,
        created_by: userMap["pm2@vertexarc.com"].id,
        is_security_sensitive: true,
        risk_level: "MEDIUM",
        security_review: null,
        comments: [
          {
            user_id: userMap["pm2@vertexarc.com"].id,
            content: "Make sure USER node:node is specified in the Dockerfile."
          }
        ],
        audit_history: [
          { action: "STATUS_CHANGED", old: { status: "TODO" }, new: { status: "IN_PROGRESS" }, actor: userMap["dev4@vertexarc.com"].id }
        ]
      },
      {
        project_id: projectMap[1].id,
        title: "Add Helmet HTTP security headers and CORS origin lock",
        description: "Block clickjacking (X-Frame-Options), MIME sniffing, and configure strict Cross-Origin isolation.",
        priority: "HIGH",
        status: "DONE",
        assigned_to: userMap["dev5@vertexarc.com"].id,
        created_by: userMap["pm2@vertexarc.com"].id,
        is_security_sensitive: true,
        risk_level: "HIGH",
        security_review: {
          code_reviewed: true,
          security_tests_passed: true,
          no_unresolved_vulnerabilities: true,
          reviewed_by: userMap["pm2@vertexarc.com"].id
        },
        comments: [
          {
            user_id: userMap["dev5@vertexarc.com"].id,
            content: "Helmet headers verified against securityheaders.com — grade A+ achieved."
          }
        ],
        audit_history: [
          { action: "STATUS_CHANGED", old: { status: "TODO" }, new: { status: "IN_PROGRESS" }, actor: userMap["dev5@vertexarc.com"].id },
          { action: "STATUS_CHANGED", old: { status: "IN_PROGRESS" }, new: { status: "IN_REVIEW" }, actor: userMap["dev5@vertexarc.com"].id },
          { action: "SECURITY_REVIEW_UPDATED", old: { codeReviewed: false, securityTestsPassed: false, noUnresolvedVulnerabilities: false }, new: { codeReviewed: true, securityTestsPassed: true, noUnresolvedVulnerabilities: true }, actor: userMap["pm2@vertexarc.com"].id },
          { action: "STATUS_CHANGED", old: { status: "IN_REVIEW" }, new: { status: "DONE" }, actor: userMap["pm2@vertexarc.com"].id }
        ]
      },
      {
        project_id: projectMap[1].id,
        title: "Automated PostgreSQL daily backup script and encryption",
        description: "Encrypt pg_dump outputs with GPG AES-256 before transferring to object storage.",
        priority: "MEDIUM",
        status: "TODO",
        assigned_to: userMap["dev1@vertexarc.com"].id,
        created_by: userMap["pm2@vertexarc.com"].id,
        is_security_sensitive: false,
        risk_level: null,
        comments: [],
        audit_history: []
      },

      // Project 3 Tasks
      {
        project_id: projectMap[2].id,
        title: "Design mobile biometric login payload validation",
        description: "Cryptographically verify device hardware key signatures on the Node.js backend.",
        priority: "HIGH",
        status: "TODO",
        assigned_to: null,
        created_by: userMap["admin@vertexarc.com"].id,
        is_security_sensitive: true,
        risk_level: "HIGH",
        security_review: null,
        comments: [
          {
            user_id: userMap["admin@vertexarc.com"].id,
            content: "Spec document uploaded to shared knowledge base. Ready for developer assignment."
          }
        ],
        audit_history: []
      }
    ];

    for (const t of TASKS) {
      const tRes = await client.query(
        `INSERT INTO tasks (
          project_id, title, description, priority, status,
          assigned_to, created_by, is_security_sensitive, risk_level
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          t.project_id,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.assigned_to,
          t.created_by,
          t.is_security_sensitive,
          t.risk_level
        ]
      );
      const taskId = tRes.rows[0].id;

      // Handle Security Review if security sensitive
      if (t.is_security_sensitive) {
        if (t.security_review) {
          await client.query(
            `INSERT INTO task_security_reviews (
              task_id, code_reviewed, security_tests_passed,
              no_unresolved_vulnerabilities, reviewed_by, reviewed_at
             )
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              taskId,
              t.security_review.code_reviewed,
              t.security_review.security_tests_passed,
              t.security_review.no_unresolved_vulnerabilities,
              t.security_review.reviewed_by
            ]
          );
        } else {
          await client.query(
            `INSERT INTO task_security_reviews (task_id) VALUES ($1)`,
            [taskId]
          );
        }
      }

      // Handle Comments
      if (t.comments && t.comments.length > 0) {
        for (const c of t.comments) {
          await client.query(
            `INSERT INTO task_comments (task_id, user_id, content)
             VALUES ($1, $2, $3)`,
            [taskId, c.user_id, c.content]
          );
        }
      }

      // Handle Task Audit Logs
      if (t.audit_history && t.audit_history.length > 0) {
        for (const a of t.audit_history) {
          await client.query(
            `INSERT INTO task_audit_logs (task_id, actor_id, action, old_value, new_value)
             VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)`,
            [
              taskId,
              a.actor,
              a.action,
              a.old ? JSON.stringify(a.old) : null,
              a.new ? JSON.stringify(a.new) : null
            ]
          );
        }
      }
    }

    await client.query("COMMIT");

    console.log("\nDATABASE SEEDING COMPLETED SUCCESSFULLY!\n");
    console.log("Projects created : " + PROJECTS.length);
    console.log("Tasks created    : " + TASKS.length);
    console.log("Users created    : " + USERS.length);
    console.log("Default password : " + DEFAULT_PASSWORD);
    console.log("---------------------------------------------------------------");
    console.log("ID | Role            | Email               | Name");
    console.log("---------------------------------------------------------------");
    Object.values(userMap).forEach((u) => {
      const id = String(u.id).padEnd(2);
      const role = u.role.padEnd(15);
      const email = u.email.padEnd(19);
      console.log(`${id} | ${role} | ${email} | ${u.name}`);
    });
    console.log("---------------------------------------------------------------");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedCompleteDatabase();

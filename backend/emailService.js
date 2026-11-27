// emailService.js — Sends transactional emails via the Brevo REST API.
// Uses Node's built-in fetch() — no extra npm package needed.

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Send a single transactional email through Brevo.
 *
 * @param {object} options
 * @param {string} options.to          - Recipient email address
 * @param {string} options.toName      - Recipient display name
 * @param {string} options.subject     - Email subject line
 * @param {string} options.htmlContent - Full HTML body of the email
 * @returns {Promise<void>}            - Resolves on success, throws on failure
 */
async function sendEmail({ to, toName, subject, htmlContent }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "VertexArc Security";

    if (!apiKey || !senderEmail) {
        throw new Error(
            "Email service is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL in your .env file."
        );
    }

    const payload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent,
    };

    const response = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
            `Brevo API error ${response.status}: ${errorBody}`
        );
    }
}

/**
 * Send a password reset email containing a one-time reset link.
 * The link encodes the plain-text token — only the SHA-256 hash is stored in the DB.
 *
 * @param {object} options
 * @param {string} options.to        - Recipient email
 * @param {string} options.name      - Recipient display name
 * @param {string} options.token     - Plain-text 64-char hex reset token
 * @param {number} options.expiryMin - Token lifetime in minutes (shown in email body)
 */
async function sendPasswordResetEmail({ to, name, token, expiryMin = 15 }) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    // The reset link carries the raw token as a query parameter.
    // The frontend reads it and passes it to POST /api/auth/reset-password.
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const subject = "VertexArc — Password Reset Request";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#0c0d16;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d16;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#13142a;border-radius:16px;border:1px solid #221c44;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #221c44;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Vertex<span style="background:linear-gradient(90deg,#3A0CA3,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Arc</span>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#6b7280;letter-spacing:0.5px;text-transform:uppercase;">
                Security Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#f9fafb;">
                Password Reset Request
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#9ca3af;line-height:1.6;">
                Hi ${name},<br/><br/>
                We received a request to reset the password for your VertexArc account
                (<strong style="color:#d1d5db;">${to}</strong>).<br/><br/>
                Click the button below to set a new password. This link expires in
                <strong style="color:#d1d5db;">${expiryMin} minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(135deg,#3A0CA3,#4c1d95);">
                    <a href="${resetLink}"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:11px;color:#4c1d95;word-break:break-all;">
                ${resetLink}
              </p>

              <!-- Security warning box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1a0a0a;border:1px solid #450a0a;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;font-size:12px;color:#fca5a5;line-height:1.6;">
                      <strong>⚠ Security notice:</strong> If you did not request this, ignore this email.
                      Your password will not change. Never share this link with anyone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #221c44;">
              <p style="margin:0;font-size:11px;color:#4b5563;text-align:center;">
                VertexArc · Secure Software Development Platform<br/>
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendEmail({ to, toName: name, subject, htmlContent });
}

module.exports = { sendEmail, sendPasswordResetEmail };

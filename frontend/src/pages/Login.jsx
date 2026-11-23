import { useState } from "react";
import { loginUser, requestPasswordReset, resetPassword } from "../api";
import { SunIcon, MoonIcon, ArrowLeftIcon, AlertCircleIcon, LockIcon, CheckIcon } from "../components/Icons";
import { VertexArcEmblem } from "../components/VertexArcLogo";

function Login({ onLogin, sessionMessage, onBack, theme, onToggleTheme }) {
  const [mode, setMode] = useState("login"); // "login" | "forgot" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password & Reset password fields
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await requestPasswordReset(resetEmail.trim());
      setSuccessMsg(data.message || "Reset instructions generated.");
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setMode("reset");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event) {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const data = await resetPassword(resetToken.trim(), newPassword);
      setSuccessMsg(data.message || "Password reset successfully. You can now log in.");
      setEmail(resetEmail);
      setPassword("");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-transparent px-4 transition-colors">
      {/* Top action bar: back to landing & theme toggle */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-6xl mx-auto">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] px-3.5 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] transition shadow-sm"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        ) : <div />}

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] transition shadow-sm"
          >
            {theme === "dark" ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
          </button>
        )}
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#221c44] bg-white dark:bg-[#0c0d16] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-[0_0_50px_-10px_rgba(58,12,163,0.3)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <VertexArcEmblem className="h-12 w-auto" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            {mode === "login" ? (
              <>Sign in to Vertex<span className="bg-gradient-to-r from-[#3A0CA3] via-[#6d28d9] to-[#7C3AED] bg-clip-text text-transparent">Arc</span></>
            ) : mode === "forgot" ? (
              "Forgot Password"
            ) : (
              "Set New Password"
            )}
          </h1>

          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            {mode === "login"
              ? "Secure Software Development & Engineering Platform"
              : mode === "forgot"
              ? "Enter your registered email to receive a password reset token"
              : "Enter your verification token and your new password"}
          </p>
        </div>

        {sessionMessage && mode === "login" && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-medium text-amber-700 dark:text-amber-300"
          >
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{sessionMessage}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
          >
            <CheckIcon className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── MODE 1: LOGIN ── */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setResetEmail(email);
                    setMode("forgot");
                  }}
                  className="text-xs font-medium text-[#3A0CA3] dark:text-[#a78bfa] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-[#3A0CA3]/25"
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </button>
          </form>
        )}

        {/* ── MODE 2: FORGOT PASSWORD ── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
              >
                Enter your account email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white py-3 text-sm font-semibold transition disabled:opacity-60 shadow-lg shadow-[#3A0CA3]/25"
            >
              {loading ? "Generating token..." : "Continue"}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("reset");
                }}
                className="text-xs font-medium text-[#3A0CA3] dark:text-[#a78bfa] hover:underline"
              >
                Already have a token?
              </button>
            </div>
          </form>
        )}

        {/* ── MODE 3: RESET PASSWORD WITH TOKEN ── */}
        {mode === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="token"
                  className="block text-xs font-semibold text-gray-700 dark:text-slate-300"
                >
                  Verification Security Token
                </label>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  Auto-populated for testing
                </span>
              </div>
              <input
                id="token"
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste security reset token"
                className="w-full font-mono text-xs rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                In production, this cryptographic one-time token is delivered via email link.
              </p>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
              >
                New Password (min 8 chars)
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#050505] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white py-3 text-sm font-semibold transition disabled:opacity-60 shadow-lg shadow-[#3A0CA3]/25"
            >
              {loading ? "Resetting password..." : "Set New Password"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500">
          <LockIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>Encrypted with TLS & Role-Scoped Tokens</span>
        </div>
      </div>
    </div>
  );
}

export default Login;


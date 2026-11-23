import { useState } from "react";
import { loginUser } from "../api";
import { SunIcon, MoonIcon, ArrowLeftIcon, AlertCircleIcon, LockIcon } from "../components/Icons";
import { VertexArcEmblem } from "../components/VertexArcLogo";

function Login({ onLogin, sessionMessage, onBack, theme, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);

      // Pass the login result to the parent component
      onLogin(data);
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
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <VertexArcEmblem className="h-12 w-auto" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-sans">
            Sign in to Vertex<span className="bg-gradient-to-r from-[#3A0CA3] via-[#6d28d9] to-[#7C3AED] bg-clip-text text-transparent">Arc</span>
          </h1>

          <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
            Secure Software Development & Engineering Platform
          </p>
        </div>

        {sessionMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-medium text-amber-700 dark:text-amber-300"
          >
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>{sessionMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-slate-300"
            >
              Password
            </label>

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

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400"
            >
              <AlertCircleIcon className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-[#3A0CA3]/25"
          >
            {loading ? "Signing in..." : "Continue with Email"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500">
          <LockIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>Encrypted with TLS & Role-Scoped Tokens</span>
        </div>
      </div>
    </div>
  );
}

export default Login;

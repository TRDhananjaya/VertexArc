import {
  SunIcon,
  MoonIcon,
  ShieldCheckIcon,
  CheckIcon,
  FolderIcon,
  FileTextIcon,
  MessageSquareIcon,
  GitPullRequestIcon,
  KeyIcon,
  UsersIcon,
  SidebarIcon
} from "../components/Icons";
import { VertexArcLogo, VertexArcEmblem } from "../components/VertexArcLogo";

const CURRENT_YEAR = new Date().getFullYear();

function LandingPage({ onGetStarted, theme, onToggleTheme }) {
  const features = [
    {
      icon: <FolderIcon className="w-5 h-5 text-indigo-500" />,
      title: "Project & Task Management",
      description:
        "Organize work into structured projects, assign tasks to qualified team members, and track priorities and deadlines in real time."
    },
    {
      icon: <KeyIcon className="w-5 h-5 text-purple-500" />,
      title: "Role-Based Access Control",
      description:
        "Granular permissions for Admins, Project Managers, and Developers. Every action is strictly validated on both frontend and backend."
    },
    {
      icon: <ShieldCheckIcon className="w-5 h-5 text-red-500" />,
      title: "Security Review Gates",
      description:
        "Security-sensitive tasks enforce a mandatory verification gate (code review, input validation, access control) before approval."
    },
    {
      icon: <FileTextIcon className="w-5 h-5 text-emerald-500" />,
      title: "Immutable Audit Trail",
      description:
        "Every status transition, security checklist update, and project deletion is cryptographically tracked with actor ID and timestamps."
    },
    {
      icon: <GitPullRequestIcon className="w-5 h-5 text-amber-500" />,
      title: "Enforced Workflow Pipeline",
      description:
        "Tasks flow reliably through TODO → IN PROGRESS → IN REVIEW → DONE with automated state machine validations at each step."
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5 text-blue-500" />,
      title: "Threaded Discussions",
      description:
        "Dedicated discussion feeds on every task keep engineering context, PR links, and feedback aligned without losing context in chat."
    }
  ];

  const roles = [
    {
      name: "Admin",
      badge: "Platform Oversight",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
      abilities: [
        "Manage user accounts & role provisioning",
        "Inspect organization-wide audit logs",
        "Oversee and archive all projects",
        "Full administrative system controls"
      ]
    },
    {
      name: "Project Manager",
      badge: "Project Ownership",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      abilities: [
        "Create and manage assigned projects",
        "Add and manage project team members",
        "Create, prioritize, and assign tasks",
        "Verify security gates and approve tasks"
      ]
    },
    {
      name: "Developer",
      badge: "Task Execution",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      abilities: [
        "View assigned projects and backlogs",
        "Advance task states through workflow",
        "Collaborate in threaded task discussions",
        "Execute development security checklists"
      ]
    }
  ];

  const workflowSteps = [
    { id: "01", name: "TODO", desc: "Backlog & Assignment", role: "Manager / Lead" },
    { id: "02", name: "IN PROGRESS", desc: "Active Implementation", role: "Assigned Developer" },
    { id: "03", name: "IN REVIEW", desc: "Mandatory Security Gate", role: "Project Reviewer" },
    { id: "04", name: "DONE", desc: "Verified & Closed", role: "Signed Off" }
  ];

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white transition-colors selection:bg-[#3A0CA3] selection:text-white font-sans antialiased">
      {/* ── TOP HEADER / NAVIGATION ── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 dark:border-[#1c1d30]/80 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Brand */}
          <VertexArcLogo
            className="h-8 w-auto"
            textClassName="text-xl font-bold tracking-tight text-gray-950 dark:text-white"
          />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-slate-300">
            <a href="#features" className="hover:text-gray-950 dark:hover:text-white transition">Features</a>
            <a href="#workflow" className="hover:text-gray-950 dark:hover:text-white transition">Workflow</a>
            <a href="#roles" className="hover:text-gray-950 dark:hover:text-white transition">Permissions</a>
            <a href="#preview" className="hover:text-gray-950 dark:hover:text-white transition">Dashboard</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-[#1c1d30] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#131422] transition"
              >
                {theme === "dark" ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-700" />}
              </button>
            )}

            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 px-5 py-2 text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION WITH CONCENTRIC ORBITS & FLOATING INTEGRATION BADGES ── */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Subtle Ambient Orbital Background Rings */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-[520px] w-[520px] md:h-[720px] md:w-[720px] rounded-full border border-gray-100 dark:border-[#3A0CA3]/15" />
          <div className="absolute h-[760px] w-[760px] md:h-[1050px] md:w-[1050px] rounded-full border border-gray-100/70 dark:border-[#3A0CA3]/10" />
          <div className="absolute h-[1020px] w-[1020px] md:h-[1380px] md:w-[1380px] rounded-full border border-gray-50 dark:border-[#0c0d16]" />
          {/* Ambient Obsidian Glow Center */}
          <div className="absolute h-[420px] w-[420px] rounded-full bg-[#3A0CA3]/20 blur-[130px] pointer-events-none" />
        </div>

        {/* Floating orbital badges */}
        <div className="pointer-events-none absolute inset-0 max-w-6xl mx-auto hidden lg:block">
          {/* Floating badge 1: Slack */}
          <div className="absolute top-24 left-16 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              #
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Slack Alerts</span>
          </div>

          {/* Floating badge 2: Meta / API */}
          <div className="absolute top-20 right-20 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
              API
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">REST Security</span>
          </div>

          {/* Floating badge 3: Security Gate */}
          <div className="absolute bottom-44 left-10 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">3-Point Gate</span>
          </div>

          {/* Floating badge 4: Audit Trail */}
          <div className="absolute bottom-40 right-12 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Audit Trail</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Social Proof Pill (Avatar stack + metric) */}
          <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] px-4 py-1.5 shadow-sm mb-8">
            <div className="flex -space-x-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                JD
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                AC
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                RK
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              24K+ <span className="font-normal text-gray-500 dark:text-slate-400">engineering teams</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.08]">
            Create better,<br />
            <span className="bg-gradient-to-r from-[#3A0CA3] via-[#7C3AED] to-[#3A0CA3] bg-clip-text text-transparent">faster, and together</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
            The modern project management tool designed specifically for developers, engineering managers,
            and security teams. Streamline your workflow from concept to verified launch.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white px-8 py-3.5 text-sm font-semibold transition shadow-xl shadow-[#3A0CA3]/35 hover:scale-[1.02]"
            >
              Get Started
            </button>

            <a
              href="#preview"
              className="rounded-full border border-gray-200 dark:border-[#1c1d30] bg-gray-50 dark:bg-[#0c0d16] px-7 py-3.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#131422] transition"
            >
              See Demo
            </a>
          </div>
        </div>

        {/* ── REALISTIC PRODUCT UI CARD PREVIEW (matching reference layout) ── */}
        <div id="preview" className="relative mx-auto max-w-6xl px-4 sm:px-6 mt-16 md:mt-20">
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 dark:border-[#2a1754] bg-white dark:bg-[#0c0d16] shadow-2xl shadow-slate-300/60 dark:shadow-[0_0_80px_-15px_rgba(58,12,163,0.35)]">
            {/* Window Topbar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#1c1d30]/80 bg-gray-50/80 dark:bg-[#050505]/80 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono text-[11px] text-gray-400 dark:text-slate-500">app.vertexarc.com/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>API Connected</span>
              </div>
            </div>

            {/* Authentic VertexArc Application Preview */}
            <div className="flex min-h-[460px] bg-[#f8f7fd]/60 dark:bg-[#050505]/60 p-4 sm:p-6 gap-5">
              {/* Floating Sidebar Dock Preview */}
              <div className="w-14 shrink-0 hidden sm:flex flex-col items-center justify-between py-3.5 rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white/90 dark:bg-[#0c0d16]/90 backdrop-blur-md shadow-lg shadow-black/5">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500">
                    <SidebarIcon className="w-3.5 h-3.5" />
                  </div>
                  <VertexArcEmblem className="h-5 w-auto" />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] text-white shadow-md shadow-[#3A0CA3]/35">
                    <FolderIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 dark:text-slate-500">
                    <FileTextIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 dark:text-slate-500">
                    <UsersIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-4 h-px bg-gray-200 dark:bg-[#1c1d30] my-1" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 dark:text-slate-500">
                    <MoonIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-500/30">
                  SA
                </div>
              </div>

              {/* Main Workspace Preview */}
              <div className="flex-1 space-y-6">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/70 dark:border-[#1c1d30] pb-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Projects</h2>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">Workspaces and active backlogs for your development teams</p>
                  </div>

                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white px-3.5 py-1.5 text-xs font-semibold transition shadow-md shadow-[#3A0CA3]/25 hover:scale-[1.02]"
                  >
                    <span>+</span>
                    <span>New Project</span>
                  </button>
                </div>

                {/* 3 Authentic Project Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project 1 */}
                  <div className="rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-5 shadow-xs transition hover:border-[#3A0CA3]/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">ID #1</span>
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:text-red-400 border border-red-500/20">
                        Gate Active
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Core Authentication Service
                    </h3>

                    <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      Zero-trust JWT authentication, refresh token rotation, and RBAC policy enforcement.
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1c1d30] flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                      <span>4 Tasks • 1 In Review</span>
                      <span className="font-medium text-[#3A0CA3] dark:text-[#a78bfa]">Open →</span>
                    </div>
                  </div>

                  {/* Project 2 */}
                  <div className="rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-5 shadow-xs transition hover:border-[#3A0CA3]/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">ID #2</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Pipeline Clear
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Cloud Infrastructure & API
                    </h3>

                    <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      PostgreSQL connection pooling, Docker container pipelines, and health endpoints.
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1c1d30] flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                      <span>6 Tasks • 3 Done</span>
                      <span className="font-medium text-[#3A0CA3] dark:text-[#a78bfa]">Open →</span>
                    </div>
                  </div>

                  {/* Project 3 */}
                  <div className="rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-5 shadow-xs transition hover:border-[#3A0CA3]/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-gray-400 dark:text-slate-500">ID #3</span>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Active Backlog
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                      Frontend Platform & UI
                    </h3>

                    <p className="mt-1.5 text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      React 19 Vite application with Obsidian Glow design system and role gating.
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1c1d30] flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
                      <span>5 Tasks • 2 In Progress</span>
                      <span className="font-medium text-[#3A0CA3] dark:text-[#a78bfa]">Open →</span>
                    </div>
                  </div>
                </div>

                {/* Recent Task Pipeline Stream */}
                <div className="rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                      Active Development Backlog
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                      3-Point Security Gate Enforced
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#1c1d30] bg-gray-50/70 dark:bg-[#050505] p-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Implement OAuth2 / JWT Session Invalidation</span>
                        <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-500">Security Sensitive</span>
                      </div>
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500">IN PROGRESS</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#1c1d30] bg-gray-50/70 dark:bg-[#050505] p-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Role-Based Access Control Endpoint Verification</span>
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">Gate Active</span>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-500">IN REVIEW</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#1c1d30] bg-gray-50/70 dark:bg-[#050505] p-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-medium text-gray-900 dark:text-white">PostgreSQL Connection Pooling & Health Checks</span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">Verified</span>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-500">DONE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ENGINEERING TEAMS LOGO STRIP ── */}
      <section className="border-y border-gray-100 dark:border-slate-900 py-12 bg-gray-50/50 dark:bg-[#050505]/50">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Trusted by security and engineering teams at leading companies
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-60 grayscale hover:grayscale-0 transition duration-300">
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">GitHub</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Framer</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Vercel</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Supabase</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Linear</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Stripe</span>
            <span className="text-sm font-bold tracking-tight text-gray-700 dark:text-slate-300">Cloudflare</span>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Platform Capabilities
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            Security embedded directly into the developer workflow
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
            Unlike generic project management boards, VertexArc introduces hard gates and verifiable checklists
            so security is never treated as an afterthought.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-gray-100 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#131422] border border-gray-100 dark:border-[#272844]">
                {feat.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WORKFLOW STATE MACHINE ── */}
      <section id="workflow" className="border-t border-gray-100 dark:border-slate-900 bg-gray-50/50 dark:bg-[#050505]/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              State Machine Execution
            </h2>
            <p className="mt-3 text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
              Predictable, gated progression
            </p>
            <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Every status change is governed by role permissions and security verification rules.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step) => (
              <div
                key={step.name}
                className="relative rounded-2xl border border-gray-200/80 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-6 shadow-xs"
              >
                <div className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
                  STEP {step.id}
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                  {step.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  {step.desc}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1c1d30] text-[11px] text-gray-400 dark:text-slate-500">
                  Authorized: <strong className="text-gray-700 dark:text-slate-300">{step.role}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE PERMISSIONS ── */}
      <section id="roles" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Role-Based Access
          </h2>
          <p className="mt-3 text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            Designed for clear separation of duties
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
            Admins, Project Managers, and Developers operate within explicitly bounded scopes.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-gray-200/90 dark:border-[#1c1d30] bg-white dark:bg-[#0c0d16] p-7 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {r.name}
                </h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${r.badgeColor}`}>
                  {r.badge}
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-gray-600 dark:text-slate-300">
                {r.abilities.map((ability) => (
                  <li key={ability} className="flex items-start gap-2.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <CheckIcon className="w-2.5 h-2.5" />
                    </span>
                    <span>{ability}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="border-t border-gray-100 dark:border-[#1c1d30] bg-gradient-to-b from-transparent via-[#3A0CA3]/5 to-[#3A0CA3]/15 dark:from-[#050505] dark:via-[#160442]/30 dark:to-[#050505] py-24 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-96 rounded-full bg-[#3A0CA3]/20 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
            Ready to build secure software together?
          </h2>
          <p className="mt-4 text-sm text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
            Experience role-based task orchestration with real-time audit trails and mandatory security reviews.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-[#3A0CA3] to-[#4c1d95] hover:from-[#4313b8] hover:to-[#5b21b6] text-white px-9 py-4 text-sm font-semibold transition shadow-xl shadow-[#3A0CA3]/40 hover:scale-[1.02]"
            >
              Launch VertexArc →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 dark:border-slate-900 py-8 text-center text-xs text-gray-400 dark:text-slate-600">
        © {CURRENT_YEAR} VertexArc. All rights reserved. Engineering & Security Workflow System.
      </footer>
    </div>
  );
}

export default LandingPage;

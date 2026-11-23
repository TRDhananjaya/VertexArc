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
  SearchIcon
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-white transition-colors selection:bg-violet-500 selection:text-white font-sans antialiased">
      {/* ── TOP HEADER / NAVIGATION ── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Brand */}
          <VertexArcLogo
            className="h-9 w-9"
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
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
          <div className="h-[520px] w-[520px] md:h-[720px] md:w-[720px] rounded-full border border-gray-100 dark:border-slate-900" />
          <div className="absolute h-[760px] w-[760px] md:h-[1050px] md:w-[1050px] rounded-full border border-gray-100/70 dark:border-slate-900/50" />
          <div className="absolute h-[1020px] w-[1020px] md:h-[1380px] md:w-[1380px] rounded-full border border-gray-50 dark:border-slate-950" />
          {/* Ambient Glow Center */}
          <div className="absolute h-96 w-96 rounded-full bg-violet-500/5 dark:bg-violet-600/10 blur-3xl pointer-events-none" />
        </div>

        {/* Floating orbital badges */}
        <div className="pointer-events-none absolute inset-0 max-w-6xl mx-auto hidden lg:block">
          {/* Floating badge 1: Slack */}
          <div className="absolute top-24 left-16 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              #
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Slack Alerts</span>
          </div>

          {/* Floating badge 2: Meta / API */}
          <div className="absolute top-20 right-20 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
              API
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">REST Security</span>
          </div>

          {/* Floating badge 3: Security Gate */}
          <div className="absolute bottom-44 left-10 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">3-Point Gate</span>
          </div>

          {/* Floating badge 4: Audit Trail */}
          <div className="absolute bottom-40 right-12 flex items-center gap-2 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-lg shadow-black/5 backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Audit Trail</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {/* Social Proof Pill (Avatar stack + metric) */}
          <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 shadow-sm mb-8">
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
            faster, and together
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
              className="rounded-full bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-xl shadow-black/20 hover:scale-[1.02]"
            >
              Get Started
            </button>

            <a
              href="#preview"
              className="rounded-full border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-7 py-3.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              See Demo
            </a>
          </div>
        </div>

        {/* ── REALISTIC PRODUCT UI CARD PREVIEW (matching reference layout) ── */}
        <div id="preview" className="relative mx-auto max-w-6xl px-4 sm:px-6 mt-16 md:mt-20">
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/60 dark:shadow-black/70">
            {/* Window Topbar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/80 dark:bg-slate-950/80 px-5 py-3">
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

            {/* Mock Dashboard Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 min-h-[420px]">
              {/* Mock Sidebar */}
              <div className="border-r border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-950/50 p-4 space-y-5 hidden md:block">
                <div className="flex items-center gap-2 px-2">
                  <VertexArcEmblem className="h-5 w-5" />
                  <span className="text-xs font-bold text-gray-800 dark:text-white">VertexArc</span>
                </div>

                {/* Mock Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    disabled
                    placeholder="Search tasks..."
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-gray-500"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="rounded-lg bg-white dark:bg-slate-900 px-3 py-2 font-semibold text-gray-900 dark:text-white shadow-xs border border-gray-200/60 dark:border-slate-800">
                    Dashboard
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900">
                    <span>Projects</span>
                    <span className="rounded bg-gray-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">3</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900">
                    <span>Tasks</span>
                    <span className="rounded bg-gray-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[10px]">8</span>
                  </div>
                  <div className="px-3 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900">
                    Security Gates
                  </div>
                  <div className="px-3 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900">
                    Audit Trail
                  </div>
                </div>
              </div>

              {/* Mock Main Area */}
              <div className="md:col-span-4 p-6 space-y-6">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Live Workspace Overview</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-3 py-1 text-xs text-gray-600 dark:text-slate-300">
                      Mar 01 - Apr 01, 2026
                    </span>
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="rounded-lg bg-gray-950 dark:bg-white text-white dark:text-gray-950 px-3 py-1 text-xs font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>

                {/* 5 Stats Cards Grid (matching reference image cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 p-3.5">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Active Projects</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">3</span>
                      <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">+4%</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 p-3.5">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Tasks Completed</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">2</span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">+14%</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 p-3.5">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">In Review</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">2</span>
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Pending</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 p-3.5">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Security Gate</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">3/3</span>
                      <span className="text-[10px] font-medium text-emerald-600">100%</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 p-3.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Audit Events</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">18</span>
                      <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">Logged</span>
                    </div>
                  </div>
                </div>

                {/* Sample Live Task Items */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">Implement OAuth2 / JWT Session Invalidation</p>
                        <p className="text-[11px] text-gray-400">Security Sensitive • Assigned to dev1</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                      IN PROGRESS
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">Role-Based Access Control Endpoint Verification</p>
                        <p className="text-[11px] text-gray-400">Security Review Gate Active • Assigned to dev2</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      IN REVIEW
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">PostgreSQL Connection Pooling & Migration Setup</p>
                        <p className="text-[11px] text-gray-400">Completed & Verified • Signed off by pm1</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      DONE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ENGINEERING TEAMS LOGO STRIP ── */}
      <section className="border-y border-gray-100 dark:border-slate-900 py-12 bg-gray-50/50 dark:bg-slate-950/50">
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
              className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
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
      <section id="workflow" className="border-t border-gray-100 dark:border-slate-900 bg-gray-50/50 dark:bg-slate-950/50 py-24">
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
                className="relative rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs"
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
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 dark:text-slate-500">
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
              className="rounded-2xl border border-gray-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xs"
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
      <section className="border-t border-gray-100 dark:border-slate-900 bg-gray-50/50 dark:bg-slate-950/50 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
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
              className="rounded-full bg-black dark:bg-white text-white dark:text-black px-8 py-3.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-xl shadow-black/15 hover:scale-[1.02]"
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

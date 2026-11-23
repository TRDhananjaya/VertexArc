import { useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import FloatingSidebar from "./components/FloatingSidebar";
import { setSessionExpiredHandler } from "./api";

// Keys used to persist session in localStorage
const SESSION_TOKEN_KEY = "vertexarc_token";
const SESSION_USER_KEY  = "vertexarc_user";
const THEME_KEY         = "vertexarc_theme"; // "dark" | "light"
const SIDEBAR_EXPANDED_KEY = "vertexarc_sidebar_expanded";

function readPersistedSession() {
  try {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(SESSION_USER_KEY) || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // Default to dark mode (matches the existing design)
  return "dark";
}

function getInitialSidebarExpanded() {
  const saved = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
  return saved === "true";
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, theme);
}

function App() {
  // Initialise state from localStorage so a page refresh keeps the user logged in
  const persisted = readPersistedSession();
  const [token, setToken] = useState(persisted.token);
  const [user, setUser]   = useState(persisted.user);
  const [selectedProject, setSelectedProject]       = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAuditLogs, setShowAuditLogs]           = useState(false);
  const [sessionMessage, setSessionMessage]         = useState("");
  const [showLogin, setShowLogin]                   = useState(false);

  // Theme: "dark" | "light"
  const [theme, setTheme] = useState(getInitialTheme);

  // Sidebar expanded / collapsed state
  const [sidebarExpanded, setSidebarExpanded] = useState(getInitialSidebarExpanded);

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  function toggleSidebarExpanded() {
    setSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(next));
      return next;
    });
  }

  useEffect(() => {
    // Register global listener for HTTP 401 Unauthorized responses
    setSessionExpiredHandler(() => {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_USER_KEY);
      setToken(null);
      setUser(null);
      setSelectedProject(null);
      setShowUserManagement(false);
      setShowAuditLogs(false);
      setSessionMessage("Your session has expired. Please sign in again.");
      setShowLogin(true);
    });
  }, []);

  function handleLogin(data) {
    if (!data.token || typeof data.token !== "string") {
      throw new Error("Login response did not contain a valid token");
    }

    // Persist session so the user stays logged in after a page refresh
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    localStorage.setItem(SESSION_USER_KEY,  JSON.stringify(data.user || null));

    setToken(data.token);
    setUser(data.user || null);
    setSelectedProject(null);
    setShowUserManagement(false);
    setShowAuditLogs(false);
    setSessionMessage("");
    setShowLogin(false);
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    setToken(null);
    setUser(null);
    setSelectedProject(null);
    setShowUserManagement(false);
    setShowAuditLogs(false);
    setSessionMessage("");
    setShowLogin(false);
  }

  function handleGoDashboard() {
    setSelectedProject(null);
    setShowUserManagement(false);
    setShowAuditLogs(false);
  }

  function handleOpenUserManagement() {
    setSelectedProject(null);
    setShowUserManagement(true);
    setShowAuditLogs(false);
  }

  function handleOpenAuditLogs() {
    setSelectedProject(null);
    setShowUserManagement(false);
    setShowAuditLogs(true);
  }

  // 1. Landing page — shown to unauthenticated users who haven't clicked "Sign In"
  if (!token && !showLogin) {
    return (
      <LandingPage
        onGetStarted={() => setShowLogin(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 2. Login page
  if (!token) {
    return (
      <Login
        onLogin={handleLogin}
        sessionMessage={sessionMessage}
        onBack={() => setShowLogin(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Determine active view for dock indicator
  const activeView = showUserManagement
    ? "users"
    : showAuditLogs
    ? "audit"
    : selectedProject
    ? "project"
    : "dashboard";

  return (
    <div className="min-h-screen text-gray-900 dark:text-white">
      {/* Floating Capsule Sidebar Dock & Expandable Panel */}
      <FloatingSidebar
        user={user}
        activeView={activeView}
        projectName={selectedProject?.name}
        onGoDashboard={handleGoDashboard}
        onOpenUserManagement={handleOpenUserManagement}
        onOpenAuditLogs={handleOpenAuditLogs}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        isExpanded={sidebarExpanded}
        onToggleExpand={toggleSidebarExpanded}
      />

      {/* Main Content Area (Offset smoothly by left dock on desktop, padded for bottom bar on mobile) */}
      <div
        className={`w-full transition-[padding] duration-300 ease-in-out pb-20 md:pb-0 ${
          sidebarExpanded ? "md:pl-80" : "md:pl-24"
        }`}
      >
        {showUserManagement && user?.role === "ADMIN" ? (
          <UserManagement
            token={token}
            user={user}
            onBack={handleGoDashboard}
            onGoDashboard={handleGoDashboard}
            onToggleSidebar={toggleSidebarExpanded}
          />
        ) : showAuditLogs && user?.role === "ADMIN" ? (
          <AdminAuditLogs
            token={token}
            user={user}
            onBack={handleGoDashboard}
            onGoDashboard={handleGoDashboard}
            onToggleSidebar={toggleSidebarExpanded}
          />
        ) : selectedProject ? (
          <ProjectDetails
            project={selectedProject}
            token={token}
            user={user}
            onBack={handleGoDashboard}
            onGoDashboard={handleGoDashboard}
            onToggleSidebar={toggleSidebarExpanded}
          />
        ) : (
          <Dashboard
            token={token}
            user={user}
            onSelectProject={(project) => {
              setSelectedProject(project);
              setShowUserManagement(false);
              setShowAuditLogs(false);
            }}
            onToggleSidebar={toggleSidebarExpanded}
          />
        )}
      </div>
    </div>
  );
}

export default App;

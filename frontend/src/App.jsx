import { useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import { setSessionExpiredHandler } from "./api";

// Keys used to persist session in localStorage
const SESSION_TOKEN_KEY = "vertexarc_token";
const SESSION_USER_KEY  = "vertexarc_user";
const THEME_KEY         = "vertexarc_theme"; // "dark" | "light"

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

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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

  // 3. User Management (Admin only)
  if (showUserManagement && user?.role === "ADMIN") {
    return (
      <UserManagement
        token={token}
        user={user}
        onLogout={handleLogout}
        onBack={handleGoDashboard}
        onGoDashboard={handleGoDashboard}
        onOpenAuditLogs={handleOpenAuditLogs}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 4. System Audit Logs (Admin only)
  if (showAuditLogs && user?.role === "ADMIN") {
    return (
      <AdminAuditLogs
        token={token}
        user={user}
        onLogout={handleLogout}
        onBack={handleGoDashboard}
        onGoDashboard={handleGoDashboard}
        onOpenUserManagement={handleOpenUserManagement}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 5. Project Details
  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        token={token}
        user={user}
        onLogout={handleLogout}
        onBack={handleGoDashboard}
        onGoDashboard={handleGoDashboard}
        onOpenUserManagement={handleOpenUserManagement}
        onOpenAuditLogs={handleOpenAuditLogs}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 6. Dashboard
  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={handleLogout}
      onSelectProject={(project) => {
        setSelectedProject(project);
        setShowUserManagement(false);
        setShowAuditLogs(false);
      }}
      onOpenUserManagement={handleOpenUserManagement}
      onOpenAuditLogs={handleOpenAuditLogs}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;

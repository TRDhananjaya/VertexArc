import { useEffect, useState } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import FloatingSidebar from "./components/FloatingSidebar";
import Toast from "./components/Toast";
import ProfileModal from "./components/ProfileModal";
import NotificationsPage from "./pages/NotificationsPage";
import {
  setSessionExpiredHandler,
  getNotifications,
  getProjects,
  markNotificationRead,
  markAllNotificationsRead
} from "./api";

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
  if (saved === "false") return false;
  return true; // Default to expanded
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
  const [initialTaskId, setInitialTaskId]           = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAuditLogs, setShowAuditLogs]           = useState(false);
  const [showNotificationsView, setShowNotificationsView] = useState(false);
  const [sessionMessage, setSessionMessage]         = useState("");
  const [showLogin, setShowLogin]                   = useState(false);

  // Theme: "dark" | "light"
  const [theme, setTheme] = useState(getInitialTheme);

  // Sidebar expanded / collapsed state
  const [sidebarExpanded, setSidebarExpanded] = useState(getInitialSidebarExpanded);

  // Global popup notification toast
  const [toast, setToast] = useState(null);

  function showToast(title, message, type = "success") {
    setToast({ id: Date.now(), title, message, type });
  }

  // User Profile & Notification states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Poll notifications periodically when user is logged in
  useEffect(() => {
    if (!token) return;
    let active = true;

    async function fetchUserNotifications() {
      try {
        const data = await getNotifications(token);
        if (!active) return;
        setNotifications(data.notifications || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      } catch {
        // Silently catch background errors
      }
    }

    fetchUserNotifications();
    const timer = setInterval(fetchUserNotifications, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [token]);

  async function handleMarkNotificationRead(id) {
    try {
      await markNotificationRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadNotificationsCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
      showToast("Notifications", "All notifications marked as read.");
    } catch (err) {
      console.error(err);
    }
  }

  function handleProfileUpdated(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedUser));
    setShowProfileModal(false);
    showToast("Profile Updated", "Your account settings have been saved successfully.");
  }

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
      setShowNotificationsView(false);
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
    setShowNotificationsView(false);
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
    setShowNotificationsView(false);
    setSessionMessage("");
    setShowLogin(false);
  }

  function handleGoDashboard() {
    setSelectedProject(null);
    setInitialTaskId(null);
    setShowUserManagement(false);
    setShowAuditLogs(false);
    setShowNotificationsView(false);
  }

  function handleOpenUserManagement() {
    setSelectedProject(null);
    setInitialTaskId(null);
    setShowUserManagement(true);
    setShowAuditLogs(false);
    setShowNotificationsView(false);
  }

  function handleOpenAuditLogs() {
    setSelectedProject(null);
    setInitialTaskId(null);
    setShowUserManagement(false);
    setShowAuditLogs(true);
    setShowNotificationsView(false);
  }

  function handleOpenNotifications() {
    setSelectedProject(null);
    setInitialTaskId(null);
    setShowUserManagement(false);
    setShowAuditLogs(false);
    setShowNotificationsView(true);
  }

  async function handleNavigateNotification(notification) {
    if (!notification) return;

    // Automatically mark as read if not already read
    if (!notification.is_read) {
      handleMarkNotificationRead(notification.id);
    }

    const link = notification.link || "";

    // 1. Dashboard link
    if (link === "/dashboard" || link === "") {
      handleGoDashboard();
      return;
    }

    // 2. Project or task link: e.g. /projects/2 or /projects/2/tasks/10
    const projectMatch = link.match(/\/projects\/(\d+)(?:\/tasks\/(\d+))?/);
    if (projectMatch) {
      const projId = Number(projectMatch[1]);
      const taskId = projectMatch[2] ? Number(projectMatch[2]) : null;

      try {
        const data = await getProjects(token);
        const targetProj = data?.projects?.find((p) => Number(p.id) === projId);

        if (targetProj) {
          setSelectedProject(targetProj);
          setInitialTaskId(taskId);
          setShowNotificationsView(false);
          setShowUserManagement(false);
          setShowAuditLogs(false);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch projects for notification navigation:", err);
      }
    }

    // Fallback if specific project isn't found
    handleGoDashboard();
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
  const activeView = showNotificationsView
    ? "notifications"
    : showUserManagement
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
        unreadNotificationCount={unreadNotificationsCount}
        onOpenNotifications={handleOpenNotifications}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Area (Offset smoothly by left dock on desktop, padded for bottom bar on mobile) */}
      <div
        className={`w-full transition-[padding] duration-300 ease-in-out pb-20 md:pb-0 ${
          sidebarExpanded ? "md:pl-80" : "md:pl-24"
        }`}
      >
        {showNotificationsView ? (
          <NotificationsPage
            user={user}
            notifications={notifications}
            unreadCount={unreadNotificationsCount}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onGoDashboard={handleGoDashboard}
            onNavigateNotification={handleNavigateNotification}
            onSelectProject={(project) => {
              setSelectedProject(project);
              setInitialTaskId(null);
              setShowNotificationsView(false);
              setShowUserManagement(false);
              setShowAuditLogs(false);
            }}
            onToggleSidebar={toggleSidebarExpanded}
          />
        ) : showUserManagement && user?.role === "ADMIN" ? (
          <UserManagement
            token={token}
            user={user}
            onBack={handleGoDashboard}
            onGoDashboard={handleGoDashboard}
            onToggleSidebar={toggleSidebarExpanded}
            showToast={showToast}
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
            initialTaskId={initialTaskId}
            onBack={handleGoDashboard}
            onGoDashboard={handleGoDashboard}
            onToggleSidebar={toggleSidebarExpanded}
            showToast={showToast}
          />
        ) : (
          <Dashboard
            token={token}
            user={user}
            onSelectProject={(project) => {
              setSelectedProject(project);
              setInitialTaskId(null);
              setShowNotificationsView(false);
              setShowUserManagement(false);
              setShowAuditLogs(false);
            }}
            onToggleSidebar={toggleSidebarExpanded}
            showToast={showToast}
          />
        )}
      </div>

      {/* Global Success & Error Toast Popup */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* User Account Settings / Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          token={token}
          onProfileUpdated={handleProfileUpdated}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

export default App;

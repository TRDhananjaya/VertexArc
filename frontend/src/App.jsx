import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);

  function handleLogin(data) {
    if (!data.token || typeof data.token !== "string") {
      throw new Error("Login response did not contain a valid token");
    }

    setToken(data.token);
    setUser(data.user || null);
    setSelectedProject(null);
    setShowUserManagement(false);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setSelectedProject(null);
    setShowUserManagement(false);
  }

  // 1. Show login page if user is not authenticated
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Show User Management page for Admin only
  if (showUserManagement && user?.role === "ADMIN") {
    return (
      <UserManagement
        token={token}
        onBack={() => setShowUserManagement(false)}
      />
    );
  }

  // 3. Show selected project details
  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        token={token}
        user={user}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  // 4. Show dashboard by default
  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={handleLogout}
      onSelectProject={(project) => {
        setSelectedProject(project);
        setShowUserManagement(false);
      }}
      onOpenUserManagement={() => {
        setSelectedProject(null);
        setShowUserManagement(true);
      }}
    />
  );
}

export default App;

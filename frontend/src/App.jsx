import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  function handleLogin(data) {
    if (!data.token || typeof data.token !== "string") {
      throw new Error("Login response did not contain a valid token");
    }

    setToken(data.token);
    setUser(data.user || null);
  }

  function handleLogout() {
    setToken(null);
    setSelectedProject(null);
    setUser(null);
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        token={token}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <Dashboard
      token={token}
      user={user}
      onLogout={handleLogout}
      onSelectProject={setSelectedProject}
    />
  );
}

export default App;

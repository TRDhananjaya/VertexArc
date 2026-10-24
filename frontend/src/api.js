const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Send login credentials to our Express backend
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

// Retrieve projects that the authenticated user can access
export async function getProjects(token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  return response.json();
}

// List tasks within a project (only for members)
export async function getProjectTasks(projectId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 401) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to load project tasks");
  }

  return response.json();
}

// Create a new project (only for admins)
export async function createProject(token, name, description) {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      description
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create project");
  }

  return data;
}

// Create a new task within a project (only for members)
export async function createTask(projectId, token, taskData) {
  const response = await fetch(
    `${API_BASE_URL}/api/projects/${projectId}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Failed to create task"
    );
  }

  return data;
}
